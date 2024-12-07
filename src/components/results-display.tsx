import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ResultsDisplay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Query results will appear here.</p>
      </CardContent>
    </Card>
  )
}

