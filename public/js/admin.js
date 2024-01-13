const allDeleteButtons = document.querySelectorAll('.delete-product');

allDeleteButtons.forEach((elem) => {
    elem.addEventListener("click", (event) => {
        const productIdInput = elem.previousElementSibling;
        const csrfTokenInput = productIdInput.previousElementSibling;

        const productId = productIdInput.value;
        const csrfToken = csrfTokenInput.value;

        fetch(`/admin/delete-product/${productId}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrfToken
            }
        })
        .then(result => result.json())
        .then(body => {
            console.log(body);
            elem.closest('article').remove();
        })
        .catch(err => {
            console.log(err);
        })
    })
})
