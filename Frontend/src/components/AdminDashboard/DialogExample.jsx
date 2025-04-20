import React from 'react'
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog'

export function DialogExample() {
  return (
    <div>
      <h2>Dialog Examples</h2>
      
      {/* Basic Dialog */}
      <Dialog>
        <DialogTrigger className="dialog-button dialog-button-primary">
          Open Basic Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Basic Dialog</DialogTitle>
            <DialogDescription>
              This is a basic dialog with a title, description, and close button.
            </DialogDescription>
          </DialogHeader>
          <p>You can add any content here.</p>
        </DialogContent>
      </Dialog>
      
      {/* Dialog with Footer */}
      <Dialog>
        <DialogTrigger className="dialog-button dialog-button-secondary" style={{ marginLeft: '10px' }}>
          Dialog with Footer
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to perform this action?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button className="dialog-button dialog-button-secondary">Cancel</button>
            <button className="dialog-button dialog-button-primary">Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog>
        <DialogTrigger className="dialog-button dialog-button-danger" style={{ marginLeft: '10px' }}>
          Delete Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button className="dialog-button dialog-button-secondary">Cancel</button>
            <button className="dialog-button dialog-button-danger">Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 