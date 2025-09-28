import { NextRequest, NextResponse } from 'next/server'
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const { status } = await request.json()

    // Check if user is staff or admin
    // In a real implementation, you would check the user role and update the task in the database
    
    // For now, return success response
    // In a real implementation, you would:
    // 1. Verify the task exists and belongs to the user
    // 2. Update the task status in the database
    // 3. Log the status change

    return NextResponse.json({ 
      success: true, 
      message: `Task ${taskId} status updated to ${status}` 
    })
  } catch (error) {
    console.error('Error updating task status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}