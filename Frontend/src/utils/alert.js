import Swal from 'sweetalert2';

export const confirmDelete = async (itemName = 'this item') => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${itemName}. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  return result.isConfirmed;
};
