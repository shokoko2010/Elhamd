const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCalendar() {
  try {
    const events = await prisma.calendarEvent.findMany({
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true
              }
            },
            serviceType: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        task: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${events.length} calendar events:`);
    events.forEach(event => {
      console.log(`- ${event.title} (${event.type}) - ${event.startTime}`);
    });
    
    // Create sample events if none exist
    if (events.length === 0) {
      console.log('No events found. Creating sample events...');
      
      const sampleEvents = [
        {
          title: 'حجز اختبار قيادة - Tata Nexon',
          description: 'عميل مهتم بتجربة Tata Nexon',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
          type: 'APPOINTMENT',
          status: 'SCHEDULED',
          location: 'المعرض الرئيسي',
          attendees: [],
          notes: 'عميل جديد، يفضل التجربة في الصباح'
        },
        {
          title: 'صيانة دورية - Tata Punch',
          description: 'صيانة دورية بعد 10000 كم',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
          type: 'TASK_DEADLINE',
          status: 'SCHEDULED',
          location: 'ورشة الصيانة',
          attendees: [],
          notes: 'تغيير زيت وفلتر'
        },
        {
          title: 'اجتماع مبيعات',
          description: 'اجتماع شهري لمراجعة الأداء',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
          type: 'MEETING',
          status: 'SCHEDULED',
          location: 'قاعة الاجتماعات',
          attendees: [],
          notes: 'مراجعة أهداف الشهر'
        }
      ];
      
      for (const eventData of sampleEvents) {
        const event = await prisma.calendarEvent.create({
          data: eventData
        });
        console.log(`Created event: ${event.title}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCalendar();