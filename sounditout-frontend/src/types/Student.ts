import { StudentGroup, GradeRange } from './Enums';


export interface Student {
    id: number;
    fullName: string;
}

export interface StudentDTO {
    fullName: string;
    gradeRange: GradeRange;
    grade: string;
    studentGroup: StudentGroup;
    age: number;
}

