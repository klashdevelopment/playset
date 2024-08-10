import { Modal, Sheet, ModalClose } from "@mui/joy";

export default function PModal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
    return (
        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={open}
          onClose={onClose}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Sheet
            variant="outlined"
            sx={{
              maxWidth: 500,
              borderRadius: 'md',
              p: 3,
              boxShadow: 'lg',
            }}
          >
            <ModalClose variant="plain" sx={{ m: 1 }} />
            {children}
          </Sheet>
        </Modal>
    )
}