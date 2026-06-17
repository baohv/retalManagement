import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import EditRoomForm from './EditRoomForm'

export default async function EditRoomPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const room = await prisma.room.findUnique({ where: { id: parseInt(id) } })
  if (!room) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <EditRoomForm room={JSON.parse(JSON.stringify({
        id: room.id,
        name: room.name,
        floor: room.floor,
        area: room.area,
        price: room.price,
        deposit: room.deposit,
        status: room.status,
        description: room.description,
        amenities: room.amenities,
      }))} />
    </div>
  )
}
