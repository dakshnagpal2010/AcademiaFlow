import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreVertical, TrendingUp, Award } from "lucide-react";

export default function Grades() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    classId: "",
    name: "",
    score: "",
    maxScore: "100",
    weight: "100",
    category: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch grades
  const { data: grades, isLoading } = useQuery({
    queryKey: ["/api/grades"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create grade mutation
  const createGradeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/grades", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({ title: "Success", description: "Grade added successfully!" });
      setShowAddModal(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add grade.", variant: "destructive" });
    },
  });

  // Update grade mutation
  const updateGradeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/grades/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({ title: "Success", description: "Grade updated successfully!" });
      setShowEditModal(false);
      setEditingGrade(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update grade.", variant: "destructive" });
    },
  });

  // Delete grade mutation
  const deleteGradeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/grades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({ title: "Success", description: "Grade deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete grade.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      classId: "",
      name: "",
      score: "",
      maxScore: "100",
      weight: "100",
      category: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.name || !formData.score || !formData.maxScore) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    createGradeMutation.mutate({
      ...formData,
      score: parseInt(formData.score),
      maxScore: parseInt(formData.maxScore),
      weight: parseInt(formData.weight),
    });
  };

  const handleEditGrade = (grade: any) => {
    setEditingGrade(grade);
    setFormData({
      classId: grade.classId,
      name: grade.name,
      score: grade.score.toString(),
      maxScore: grade.maxScore.toString(),
      weight: grade.weight.toString(),
      category: grade.category || "",
      date: grade.date || new Date().toISOString().split('T')[0],
    });
    setShowEditModal(true);
  };

  const handleUpdateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;
    updateGradeMutation.mutate({
      id: editingGrade.id,
      data: {
        ...formData,
        score: parseInt(formData.score),
        maxScore: parseInt(formData.maxScore),
        weight: parseInt(formData.weight),
      },
    });
  };

  const handleDeleteGrade = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteGradeMutation.mutate(id);
    }
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(2);
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", color: "bg-green-500" };
    if (percentage >= 80) return { grade: "B", color: "bg-blue-500" };
    if (percentage >= 70) return { grade: "C", color: "bg-yellow-500" };
    if (percentage >= 60) return { grade: "D", color: "bg-orange-500" };
    return { grade: "F", color: "bg-red-500" };
  };

  // Group grades by class
  const gradesByClass = Array.isArray(grades) && Array.isArray(classes)
    ? classes.map((cls: any) => ({
        class: cls,
        grades: grades.filter((g: any) => g.classId === cls.id),
      })).filter((item) => item.grades.length > 0)
    : [];

  // Filter by selected class
  const filteredGradesByClass = selectedClassFilter === "all"
    ? gradesByClass
    : gradesByClass.filter((item) => item.class.id === selectedClassFilter);

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
            <h1 className="text-3xl font-bold" data-testid="text-grades-title">Grades</h1>
            <p className="text-gray-400 mt-1">Track your academic performance</p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-grade"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grade
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Filter */}
        <div className="mb-6 flex gap-4 items-center">
          <Label className="text-white">Filter by Class:</Label>
          <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
            <SelectTrigger className="w-64 bg-dark-secondary border-gray-600 text-white" data-testid="select-class-filter">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="bg-dark-tertiary border-gray-600">
              <SelectItem value="all">All Classes</SelectItem>
              {Array.isArray(classes) && classes.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grades by Class */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredGradesByClass.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No grades yet</p>
            <p className="text-gray-500 mt-2">Add your first grade to start tracking your performance</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGradesByClass.map(({ class: cls, grades: classGrades }) => {
              const totalScore = classGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * g.weight, 0);
              const totalWeight = classGrades.reduce((sum: number, g: any) => sum + g.weight, 0);
              const classAverage = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
              const letterGrade = getLetterGrade(classAverage);

              return (
                <Card key={cls.id} className="bg-dark-secondary border-gray-700" data-testid={`card-class-${cls.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {cls.name}
                          <Badge className={`${letterGrade.color} text-white`}>
                            {letterGrade.grade} - {classAverage.toFixed(2)}%
                          </Badge>
                        </CardTitle>
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {classGrades.map((grade: any) => {
                        const percentage = parseFloat(calculatePercentage(grade.score, grade.maxScore));
                        const gradeInfo = getLetterGrade(percentage);

                        return (
                          <div key={grade.id} className="bg-dark-tertiary rounded-lg p-4 flex justify-between items-center" data-testid={`grade-item-${grade.id}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-white">{grade.name}</h4>
                                <Badge className={`${gradeInfo.color} text-white`}>
                                  {gradeInfo.grade}
                                </Badge>
                                {grade.category && (
                                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                                    {grade.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                <span>Score: {grade.score}/{grade.maxScore} ({percentage}%)</span>
                                <span>Weight: {grade.weight}%</span>
                                {grade.date && <span>Date: {new Date(grade.date).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`button-grade-menu-${grade.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-dark-tertiary border-gray-600">
                                <DropdownMenuItem 
                                  onClick={() => handleEditGrade(grade)}
                                  className="text-gray-300 hover:bg-dark-secondary"
                                  data-testid={`button-edit-grade-${grade.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteGrade(grade.id, grade.name)}
                                  className="text-red-400 hover:bg-red-500/20"
                                  data-testid={`button-delete-grade-${grade.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Grade Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Grade</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new grade to track your academic performance
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGrade} className="space-y-4">
            <div>
              <Label htmlFor="gradeClass" className="text-white">Class *</Label>
              <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-grade-class">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent className="bg-dark-tertiary border-gray-600">
                  {Array.isArray(classes) && classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gradeName" className="text-white">Assignment/Test Name *</Label>
              <Input
                id="gradeName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Midterm Exam, Quiz 1"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-grade-name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradeScore" className="text-white">Score *</Label>
                <Input
                  id="gradeScore"
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  placeholder="85"
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-grade-score"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gradeMaxScore" className="text-white">Max Score *</Label>
                <Input
                  id="gradeMaxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  placeholder="100"
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-grade-max-score"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradeWeight" className="text-white">Weight %</Label>
                <Input
                  id="gradeWeight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="100"
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-grade-weight"
                />
              </div>
              <div>
                <Label htmlFor="gradeDate" className="text-white">Date</Label>
                <Input
                  id="gradeDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-grade-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gradeCategory" className="text-white">Category</Label>
              <Input
                id="gradeCategory"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Quiz, Test, Homework"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-grade-category"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                disabled={createGradeMutation.isPending}
                data-testid="button-save-grade"
              >
                {createGradeMutation.isPending ? "Adding..." : "Add Grade"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => setShowAddModal(false)}
                data-testid="button-cancel-add-grade"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Grade Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Grade</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update grade information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateGrade} className="space-y-4">
            <div>
              <Label htmlFor="editGradeClass" className="text-white">Class *</Label>
              <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-edit-grade-class">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent className="bg-dark-tertiary border-gray-600">
                  {Array.isArray(classes) && classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editGradeName" className="text-white">Assignment/Test Name *</Label>
              <Input
                id="editGradeName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-edit-grade-name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGradeScore" className="text-white">Score *</Label>
                <Input
                  id="editGradeScore"
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-edit-grade-score"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editGradeMaxScore" className="text-white">Max Score *</Label>
                <Input
                  id="editGradeMaxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-edit-grade-max-score"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGradeWeight" className="text-white">Weight %</Label>
                <Input
                  id="editGradeWeight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-edit-grade-weight"
                />
              </div>
              <div>
                <Label htmlFor="editGradeDate" className="text-white">Date</Label>
                <Input
                  id="editGradeDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-edit-grade-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editGradeCategory" className="text-white">Category</Label>
              <Input
                id="editGradeCategory"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-edit-grade-category"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                disabled={updateGradeMutation.isPending}
                data-testid="button-update-grade"
              >
                {updateGradeMutation.isPending ? "Updating..." : "Update Grade"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGrade(null);
                }}
                data-testid="button-cancel-edit-grade"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
