import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { writeFile } from "fs/promises";

interface Column {
    start: number;
    end: number;
    header: string;
}

function findColumns(lines: string[]): Column[] {
    // Look for lines with consistent spacing and multiple columns
    const columnMarkers: number[] = [];
    const potentialHeaderLine =
        lines.find(
            (line) =>
                line.includes("Service") ||
                line.includes("Code") ||
                line.includes("Amount") ||
                line.includes("Date")
        ) || "";

    // Find column boundaries by looking for groups of spaces
    let inSpace = false;
    for (let i = 0; i < potentialHeaderLine.length; i++) {
        if (potentialHeaderLine[i] === " " && !inSpace) {
            inSpace = true;
            columnMarkers.push(i);
        } else if (potentialHeaderLine[i] !== " " && inSpace) {
            inSpace = false;
            columnMarkers.push(i);
        }
    }

    // Group markers into column pairs
    const columns: Column[] = [];
    for (let i = 0; i < columnMarkers.length - 1; i += 2) {
        const start = columnMarkers[i];
        const end = columnMarkers[i + 1];
        if (end - start > 2) {
            // Minimum column width
            columns.push({
                start,
                end,
                header: potentialHeaderLine.slice(start, end).trim(),
            });
        }
    }

    return columns;
}

function parseTableRow(line: string, columns: Column[]): string[] {
    return columns
        .map((col) => line.slice(col.start, col.end).trim())
        .filter((cell) => cell.length > 0);
}

function formatMarkdownTable(headers: string[], rows: string[][]): string {
    if (headers.length === 0 || rows.length === 0) return "";

    let markdown = "\n";
    // Headers
    markdown += "| " + headers.join(" | ") + " |\n";
    // Separator
    markdown += "| " + headers.map(() => "---").join(" | ") + " |\n";
    // Rows
    rows.forEach((row) => {
        if (row.some((cell) => cell.length > 0)) {
            markdown += "| " + row.join(" | ") + " |\n";
        }
    });

    return markdown;
}

function detectTableSection(lines: string[]): boolean {
    // Check for consistent spacing patterns or known table indicators
    return lines.some(
        (line) =>
            (line.includes("LABORATORY") || line.includes("Service")) &&
            line.split(/\s{2,}/).length >= 3
    );
}

async function convertPDFToMarkdown(filePath: string): Promise<string> {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    let markdown = "";

    for (const doc of docs) {
        const lines = doc.pageContent.split("\n").filter((line) => line.trim());
        let i = 0;

        while (i < lines.length) {
            // Check for potential table start
            if (detectTableSection(lines.slice(i, i + 5))) {
                const columns = findColumns(lines.slice(i, i + 5));
                if (columns.length > 0) {
                    const tableRows: string[][] = [];
                    const headers = columns.map((col) => col.header);

                    // Collect table rows
                    while (i < lines.length && detectTableSection([lines[i]])) {
                        const row = parseTableRow(lines[i], columns);
                        if (row.length > 0) {
                            tableRows.push(row);
                        }
                        i++;
                    }

                    // Add table to markdown
                    if (tableRows.length > 0) {
                        markdown += formatMarkdownTable(headers, tableRows);
                        markdown += "\n";
                        continue;
                    }
                }
            }

            // Non-table content
            markdown += lines[i] + "\n\n";
            i++;
        }

        // Add page separator
        markdown += "---\n\n";
    }

    return markdown;
}

export async function convertPDFWithDynamicPath(
    inputPath: string
): Promise<string> {
    try {
        // Get the absolute path if not already absolute
        const absolutePath = path.isAbsolute(inputPath)
            ? inputPath
            : path.resolve(inputPath);

        // Extract directory and filename
        const dir = path.dirname(absolutePath);
        const filename = path.basename(absolutePath);

        // Generate output filename with .md extension
        const outputFilename = filename.replace(/\.pdf$/i, ".md");
        const outputPath = path.join(dir, outputFilename);

        console.log(`Converting ${absolutePath} to markdown...`);

        // Perform the conversion
        const markdown = await convertPDFToMarkdown(absolutePath);

        // Write to the output file
        await writeFile(outputPath, markdown);

        return outputPath;
    } catch (error) {
        console.error("Error processing PDF:", error);
        throw error; // Re-throw to allow calling code to handle the error
    }
}