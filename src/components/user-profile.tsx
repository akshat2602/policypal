"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type UserProfile = {
  name: string
  insuranceProvider: string
  policyNumber: string
  cardImageUrl: string
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newProfile: UserProfile = {
      name: formData.get('name') as string,
      insuranceProvider: formData.get('insuranceProvider') as string,
      policyNumber: formData.get('policyNumber') as string,
      cardImageUrl: profile?.cardImageUrl || '/placeholder.svg'
    }
    setProfile(newProfile)
    setIsEditing(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload this file to a server and get a URL back
      // For this example, we'll just use a placeholder URL
      const cardImageUrl = '/placeholder.svg'
      setProfile(prev => prev ? { ...prev, cardImageUrl } : { name: '', insuranceProvider: '', policyNumber: '', cardImageUrl })
    }
  }

  if (!profile && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsEditing(true)}>Create Profile</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={profile?.name} required />
            </div>
            <div>
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input id="insuranceProvider" name="insuranceProvider" defaultValue={profile?.insuranceProvider} required />
            </div>
            <div>
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input id="policyNumber" name="policyNumber" defaultValue={profile?.policyNumber} required />
            </div>
            <div>
              <Label htmlFor="insuranceCard">Upload Insurance Card</Label>
              <Input id="insuranceCard" type="file" accept="image/*" onChange={handleFileUpload} />
            </div>
            <Button type="submit">Save Profile</Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.cardImageUrl} alt="Insurance Card" />
                <AvatarFallback>IC</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profile?.name}</p>
                <p className="text-sm text-gray-500">{profile?.insuranceProvider}</p>
                <p className="text-sm text-gray-500">Policy: {profile?.policyNumber}</p>
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

