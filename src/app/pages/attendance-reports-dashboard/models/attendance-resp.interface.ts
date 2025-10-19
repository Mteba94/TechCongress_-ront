export interface metricsData{
    totalAttendance: number,
    completionRate: number,
    activeSessions: number,
    avgParticipation: number
}

export interface chartsData{
    activityData: activityData,
    hourlyData: hourlyData,
    demographicsData: demographicsData
}

export interface activityData{
    name: string,
    attendance: number;
}

export interface hourlyData{
    hour: string,
    participants: number
}

export interface demographicsData{
    name: string,
    value: number
}

export interface attendanceData {
    id: number,
    participantName: string,
    email: string,
    activity: string,
    activityType: string,
    checkInTime: Date,
    status: string,
    studentType: string,
    institution: string
}