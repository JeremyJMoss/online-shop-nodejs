const stripe = Stripe('pk_test_51OYHxJKQruq8RKv6N04J5LZmTcVoQjUxVye0FlCzle3PHVW4KSX0eXSbtB6c7ABJHqta7SYrnNjMm4i49hR0dhxG00MuAssMSx');
const orderBtn = document.getElementById('order-btn');
const sessionId = document.getElementById('session_id').value;
console.log(sessionId);
orderBtn.addEventListener('click', () => {
    stripe.redirectToCheckout({
        sessionId,
    });
})