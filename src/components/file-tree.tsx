"use client"

import { useState } from 'react'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'

type FileNode = {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

type FileTreeProps = {
  files: FileNode[]
}

type FileTreeNodeProps = {
  node: FileNode
  level: number
}

function FileTreeNode({ node, level }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer",
          level > 0 && "ml-4"
        )}
        onClick={toggleOpen}
      >
        {node.type === 'directory' && (
          isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />
        )}
        {node.type === 'file' ? (
          <File className="h-4 w-4 mr-1" />
        ) : (
          <Folder className="h-4 w-4 mr-1" />
        )}
        <span className="text-sm">{node.name}</span>
      </div>
      {node.type === 'directory' && isOpen && node.children && (
        <div>
          {node.children.map((childNode, index) => (
            <FileTreeNode key={index} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({ files }: FileTreeProps) {
  return (
    <div className="mt-4">
      {files.map((file, index) => (
        <FileTreeNode key={index} node={file} level={0} />
      ))}
    </div>
  )
}

