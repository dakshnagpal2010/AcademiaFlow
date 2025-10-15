import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Users, 
  Clock,
  MapPin,
  GripVertical
} from "lucide-react";
import AddClassModal from "@/components/add-class-modal";
import EditClassModal from "@/components/edit-class-modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Class Card Component
function SortableClassCard({ classItem, onDelete, onEdit }: { classItem: any; onDelete: (id: string) => void; onEdit: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: classItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="bg-dark-secondary border-gray-700 hover-lift relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: classItem.color }}
        />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 pt-1 flex-shrink-0"
              data-testid={`drag-handle-${classItem.id}`}
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-white truncate" data-testid={`text-class-name-${classItem.id}`}>
                {classItem.name}
              </CardTitle>
              {classItem.code && (
                <CardDescription className="text-gray-400" data-testid={`text-class-code-${classItem.id}`}>
                  {classItem.code}
                </CardDescription>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white flex-shrink-0"
                  data-testid={`button-class-menu-${classItem.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-dark-tertiary border-gray-600">
                <DropdownMenuItem 
                  className="text-white hover:bg-dark-secondary"
                  onClick={() => onEdit(classItem.id)}
                  data-testid={`menu-edit-class-${classItem.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Class
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 hover:bg-dark-secondary"
                  onClick={() => onDelete(classItem.id)}
                  data-testid={`menu-delete-class-${classItem.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {classItem.instructor && (
            <div className="flex items-center text-sm text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              <span data-testid={`text-instructor-${classItem.id}`}>{classItem.instructor}</span>
            </div>
          )}
          
          {classItem.room && (
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span data-testid={`text-room-${classItem.id}`}>{classItem.room}</span>
            </div>
          )}
          
          {classItem.credits && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Credits</span>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {classItem.credits}
              </Badge>
            </div>
          )}

          {classItem.description && (
            <p className="text-sm text-gray-400 line-clamp-2" data-testid={`text-description-${classItem.id}`}>
              {classItem.description}
            </p>
          )}

          <div className="pt-3 border-t border-gray-600">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-600 text-gray-300 hover:bg-dark-tertiary"
              data-testid={`button-view-assignments-${classItem.id}`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Assignments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Classes() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [localClasses, setLocalClasses] = useState<any[]>([]);

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Classes query
  const { data: classes, isLoading, error } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Sync local classes with server data
  useEffect(() => {
    if (classes) {
      setLocalClasses(classes);
    }
  }, [classes]);

  // Reorder classes mutation
  const reorderClassesMutation = useMutation({
    mutationFn: async (classIds: string[]) => {
      await apiRequest("POST", "/api/classes/reorder", { classIds });
    },
    onSuccess: () => {
      // Invalidate queries to keep other views in sync
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Classes reordered successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to reorder classes. Please try again.",
        variant: "destructive",
      });
      // Revert to server data on error
      if (classes) {
        setLocalClasses(classes);
      }
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      await apiRequest("DELETE", `/api/classes/${classId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Class deleted successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClass = (classId: string) => {
    if (window.confirm("Are you sure you want to delete this class? This will also delete all associated assignments.")) {
      deleteClassMutation.mutate(classId);
    }
  };

  const handleEditClass = (classId: string) => {
    setEditingClassId(classId);
    setShowEditModal(true);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localClasses.findIndex((item) => item.id === active.id);
      const newIndex = localClasses.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(localClasses, oldIndex, newIndex);
      setLocalClasses(newOrder);

      // Save new order to backend
      const classIds = newOrder.map((c) => c.id);
      reorderClassesMutation.mutate(classIds);
    }
  };

  // Filter based on search term - use localClasses when not searching, filteredClasses when searching
  const displayClasses = searchTerm
    ? localClasses.filter((classItem: any) =>
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : localClasses;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="bg-dark-secondary/80 glass-effect border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-classes-title">Classes</h1>
            <p className="text-gray-400 mt-1">Manage your courses and schedules</p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-class-header"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-secondary border-gray-600 text-white"
              data-testid="input-search-classes"
            />
          </div>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayClasses.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayClasses.map((c: any) => c.id)}
              strategy={verticalListSortingStrategy}
              disabled={!!searchTerm}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayClasses.map((classItem: any) => (
                  <SortableClassCard
                    key={classItem.id}
                    classItem={classItem}
                    onDelete={handleDeleteClass}
                    onEdit={handleEditClass}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Classes Found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? "No classes match your search criteria. Try adjusting your search terms."
                : "Get started by adding your first class to begin organizing your academic schedule."
              }
            </p>
            <Button
              className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
              onClick={() => setShowAddModal(true)}
              data-testid="button-add-first-class"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Class
            </Button>
          </div>
        )}
      </main>

      {/* Add Class Modal */}
      <AddClassModal open={showAddModal} onOpenChange={setShowAddModal} />
      
      {/* Edit Class Modal */}
      <EditClassModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        classId={editingClassId}
      />
    </div>
  );
}
