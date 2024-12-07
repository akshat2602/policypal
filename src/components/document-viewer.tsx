import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DocumentViewer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Select a document to view its contents here.</p>
      </CardContent>
    </Card>
  )
}

