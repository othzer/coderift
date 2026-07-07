
"use client"

import Image from "next/image"
import { format } from "date-fns"
import type { Project } from "../types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Copy, Eye, Globe, Lock, Link2 } from "lucide-react"
import { toast } from "sonner"
import { MarkedToggleButton } from "./marked-toggle"
import { togglePlaygroundVisibility } from "../actions"


interface ProjectTableProps {
  projects: Project[]
  onUpdateProject?: (id: string, data: { title: string; description: string }) => Promise<void>
  onDeleteProject?: (id: string) => Promise<void>
  onDuplicateProject?: (id: string) => Promise<unknown>
}

interface EditProjectData {
  title: string
  description: string
}

export default function ProjectTable({
  projects,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
}: ProjectTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editData, setEditData] = useState<EditProjectData>({ title: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [publicIds, setPublicIds] = useState<Set<string>>(
    () => new Set(projects.filter((p) => p.isPublic).map((p) => p.id))
  )
  const router = useRouter()

  const setPublic = (id: string, value: boolean) => {
    setPublicIds((prev) => {
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }

  // Make the playground public (if needed) and copy its read-only share link.
  const handleCopyShareLink = async (project: Project) => {
    try {
      if (!publicIds.has(project.id)) {
        await togglePlaygroundVisibility(project.id, true)
        setPublic(project.id, true)
        toast.success("Playground is now public")
      }
      const url = `${window.location.origin}/share/${project.id}`
      await navigator.clipboard.writeText(url)
      toast.success("Share link copied to clipboard")
      router.refresh()
    } catch (error) {
      console.error("Failed to create share link:", error)
      toast.error("Failed to create share link")
    }
  }

  const handleMakePrivate = async (project: Project) => {
    try {
      await togglePlaygroundVisibility(project.id, false)
      setPublic(project.id, false)
      toast.success("Playground is now private")
      router.refresh()
    } catch (error) {
      console.error("Failed to update visibility:", error)
      toast.error("Failed to update visibility")
    }
  }

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditData({
      title: project.title,
      description: project.description || ""
    })
    setEditDialogOpen(true);
  }

  const handleDeleteClick = async (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  }

  const handleUpdateProject = async () => {
    if(!selectedProject || !onUpdateProject) return;

    setIsLoading(true);

    try {
      await onUpdateProject(selectedProject.id, editData)
      setEditDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project updated successfully")
    } catch (error) {
      toast.error("Failed to update project");
      console.log(error);
    } finally{
      setIsLoading(false);
    }
  }

  const handleDeleteProject = async () => {
    if(!selectedProject || !onDeleteProject) return;

    setIsLoading(true);

    try {
      await onDeleteProject(selectedProject.id)
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project deleted successfully")
    } catch (error) {
      toast.error("Failed to delete project");
      console.log(error);
    } finally{
      setIsLoading(false);
    }
  }

  const handleDuplicateProject = async (project: Project) => {
    if(!onDuplicateProject) return;

    setIsLoading(true);
    
    try {
      await onDuplicateProject(project.id)
      toast.success("Project copied successfully")
    } catch (error) {
      toast.error("Failed to copy project");
      console.log("Error copying project", error);
    } finally{
      setIsLoading(false);
    }
  }


  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Link href={`/playground/${project.id}`} className="hover:underline">
                        <span className="font-semibold">{project.title}</span>
                      </Link>
                      {publicIds.has(project.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          <Globe className="h-2.5 w-2.5" /> Public
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground line-clamp-1">{project.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {project.template}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                  {format(new Date(project.createdAt), "MMM dd, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={project.user.image || "/placeholder.svg"}
                        alt={project.user.name || "User"}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm">{project.user.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <MarkedToggleButton markedForRevision={project.starmark?.[0]?.isMarked} id={project.id} />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/playground/${project.id}`} className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Open Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/playground/${project.id}`} target="_blank" className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditClick(project)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProject(project)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCopyShareLink(project)}>
                        <Link2 className="h-4 w-4 mr-2" />
                        {publicIds.has(project.id) ? "Copy share link" : "Share (make public)"}
                      </DropdownMenuItem>
                      {publicIds.has(project.id) && (
                        <DropdownMenuItem onClick={() => handleMakePrivate(project)}>
                          <Lock className="h-4 w-4 mr-2" />
                          Make private
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(project)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={editData.title}
                onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateProject} disabled={isLoading || !editData.title.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone. All files and
              data associated with this project will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}