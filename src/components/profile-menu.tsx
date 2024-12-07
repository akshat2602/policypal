"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Profile = {
  id: string
  name: string
  avatarUrl: string
}

export function ProfileMenu() {
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: '1', name: 'John Doe', avatarUrl: '/placeholder.svg' },
  ])
  const [currentProfile, setCurrentProfile] = useState<Profile>(profiles[0])
  const [isAddingProfile, setIsAddingProfile] = useState(false)

  const handleAddProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      avatarUrl: '/placeholder.svg',
    }
    setProfiles([...profiles, newProfile])
    setIsAddingProfile(false)
  }

  const handleAddInsuranceCard = (profileId: string) => {
    // In a real app, this would open a file picker and upload the image
    console.log(`Adding insurance card for profile ${profileId}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentProfile.avatarUrl} alt={currentProfile.name} />
            <AvatarFallback>{currentProfile.name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentProfile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentProfile.id}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profiles.map((profile) => (
          <DropdownMenuItem key={profile.id} onSelect={() => setCurrentProfile(profile)}>
            {profile.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleAddInsuranceCard(currentProfile.id)}>
          Add Insurance Card
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setIsAddingProfile(true)}>
          Add New Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
      <Dialog open={isAddingProfile} onOpenChange={setIsAddingProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProfile} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter profile name"
                className="col-span-3"
              />
            </div>
            <Button type="submit" className="ml-auto">
              Add Profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}

