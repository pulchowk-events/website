'use client'

import AddEventModal from '@/app/components/events/AddEventModal';
import { Button } from '@/components/ui/button';
import { useState } from 'react'

export default function ClientAddEventButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700"
      >
        Add Event
      </Button>

      {showModal && <AddEventModal onClose={() => setShowModal(false)} />}
    </>
  );
}