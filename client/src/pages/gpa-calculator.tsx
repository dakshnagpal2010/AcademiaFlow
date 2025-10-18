import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, TrendingUp, Award, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type GPAScale = "4.0" | "5.0" | "5.5" | "6.0";

export default function GPACalculator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedScale, setSelectedScale] = useState<GPAScale>("4.0");

  // Fetch classes and grades
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: grades } = useQuery({
    queryKey: ["/api/grades"],
    enabled: isAuthenticated,
    retry: false,
  });

  // GPA conversion tables
  const gpaScales = {
    "4.0": {
      name: "4.0 Unweighted",
      description: "Standard unweighted GPA scale",
      values: {
        A: 4.0,
        B: 3.0,
        C: 2.0,
        D: 1.0,
        F: 0.0,
      },
    },
    "5.0": {
      name: "5.0 Weighted",
      description: "Weighted scale for honors/AP courses",
      values: {
        A: 5.0,
        B: 4.0,
        C: 3.0,
        D: 2.0,
        F: 0.0,
      },
    },
    "5.5": {
      name: "5.5 Weighted",
      description: "Extended weighted scale",
      values: {
        A: 5.5,
        B: 4.5,
        C: 3.5,
        D: 2.5,
        F: 0.0,
      },
    },
    "6.0": {
      name: "6.0 Weighted",
      description: "Maximum weighted scale",
      values: {
        A: 6.0,
        B: 5.0,
        C: 4.0,
        D: 3.0,
        F: 0.0,
      },
    },
  };

  const getLetterGrade = (percentage: number): "A" | "B" | "C" | "D" | "F" => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const calculateGPA = () => {
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return {
        gpa: 0,
        totalCredits: 0,
        breakdown: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        classSummary: [],
      };
    }

    const scale = gpaScales[selectedScale];
    const breakdown = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const classSummary: any[] = [];

    // Group grades by class
    const gradesByClass = grades.reduce((acc: any, grade: any) => {
      if (!acc[grade.classId]) {
        acc[grade.classId] = [];
      }
      acc[grade.classId].push(grade);
      return acc;
    }, {});

    let totalPoints = 0;
    let totalCredits = 0;

    // Calculate GPA per class
    Object.entries(gradesByClass).forEach(([classId, classGrades]: [string, any]) => {
      const className = classes?.find((c: any) => c.id === classId)?.name || "Unknown Class";
      
      // Calculate weighted average for the class
      const totalScore = classGrades.reduce((sum: number, g: any) => 
        sum + (g.score / g.maxScore) * g.weight, 0
      );
      const totalWeight = classGrades.reduce((sum: number, g: any) => sum + g.weight, 0);
      const classAverage = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
      
      const letterGrade = getLetterGrade(classAverage);
      const gradePoint = scale.values[letterGrade];
      
      breakdown[letterGrade]++;
      totalPoints += gradePoint;
      totalCredits += 1; // Each class counts as 1 credit
      
      classSummary.push({
        className,
        average: classAverage.toFixed(2),
        letterGrade,
        gradePoint,
      });
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return {
      gpa: parseFloat(gpa.toFixed(2)),
      totalCredits,
      breakdown,
      classSummary,
    };
  };

  const gpaData = calculateGPA();
  const maxGPA = parseFloat(selectedScale);
  const gpaPercentage = (gpaData.gpa / maxGPA) * 100;

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
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-gpa-title">
              <Calculator className="h-8 w-8 text-primary-400" />
              GPA Calculator
            </h1>
            <p className="text-gray-400 mt-1">Track your academic performance across different scales</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Scale Selector */}
        <Card className="bg-dark-secondary border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <Label className="text-white text-lg mb-2 block">GPA Scale</Label>
                <Select value={selectedScale} onValueChange={(value: any) => setSelectedScale(value)}>
                  <SelectTrigger className="w-full bg-dark-tertiary border-gray-600 text-white text-lg" data-testid="select-gpa-scale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border-gray-600">
                    {Object.entries(gpaScales).map(([key, scale]) => (
                      <SelectItem key={key} value={key} className="text-white">
                        <div>
                          <div className="font-semibold">{scale.name}</div>
                          <div className="text-sm text-gray-400">{scale.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* GPA Display */}
              <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent" data-testid="text-current-gpa">
                  {gpaData.gpa.toFixed(2)}
                </div>
                <div className="text-gray-400 mt-2">out of {maxGPA.toFixed(1)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={gpaPercentage} className="h-3 bg-gray-700" />
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>0.0</span>
                <span>{gpaPercentage.toFixed(1)}%</span>
                <span>{maxGPA.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Breakdown */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-400" />
                Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gpaData.totalCredits === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No grades available</p>
                  <p className="text-sm text-gray-500 mt-2">Add grades to calculate your GPA</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(gpaData.breakdown).map(([letter, count]) => {
                    const percentage = gpaData.totalCredits > 0 
                      ? ((count as number) / gpaData.totalCredits) * 100 
                      : 0;
                    const gradePoint = gpaScales[selectedScale].values[letter as keyof typeof gpaScales[typeof selectedScale]["values"]];
                    
                    return (
                      <div key={letter}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                              letter === "A" ? "bg-green-500/20 text-green-400" :
                              letter === "B" ? "bg-blue-500/20 text-blue-400" :
                              letter === "C" ? "bg-yellow-500/20 text-yellow-400" :
                              letter === "D" ? "bg-orange-500/20 text-orange-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {letter}
                            </div>
                            <div>
                              <div className="text-white font-medium">{gradePoint.toFixed(1)} points</div>
                              <div className="text-sm text-gray-400">{count} {count === 1 ? 'class' : 'classes'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2 bg-gray-700" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Summary */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-400" />
                Class Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gpaData.classSummary.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No classes with grades</p>
                  <p className="text-sm text-gray-500 mt-2">Start adding grades to your classes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gpaData.classSummary.map((cls, index) => (
                    <div 
                      key={index} 
                      className="bg-dark-tertiary rounded-lg p-4 flex justify-between items-center"
                      data-testid={`class-summary-${index}`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{cls.className}</h4>
                        <div className="text-sm text-gray-400 mt-1">
                          Average: {cls.average}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          cls.letterGrade === "A" ? "text-green-400" :
                          cls.letterGrade === "B" ? "text-blue-400" :
                          cls.letterGrade === "C" ? "text-yellow-400" :
                          cls.letterGrade === "D" ? "text-orange-400" :
                          "text-red-400"
                        }`}>
                          {cls.letterGrade}
                        </div>
                        <div className="text-sm text-gray-400">{cls.gradePoint.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* GPA Scale Reference */}
        <Card className="bg-dark-secondary border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Current Scale: {gpaScales[selectedScale].name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(gpaScales[selectedScale].values).map(([letter, points]) => (
                <div key={letter} className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    letter === "A" ? "text-green-400" :
                    letter === "B" ? "text-blue-400" :
                    letter === "C" ? "text-yellow-400" :
                    letter === "D" ? "text-orange-400" :
                    "text-red-400"
                  }`}>
                    {letter}
                  </div>
                  <div className="text-gray-300 text-lg font-semibold">{points.toFixed(1)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {letter === "A" ? "90-100%" :
                     letter === "B" ? "80-89%" :
                     letter === "C" ? "70-79%" :
                     letter === "D" ? "60-69%" :
                     "0-59%"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
