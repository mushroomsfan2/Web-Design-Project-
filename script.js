document.addEventListener('DOMContentLoaded', function() {
    
    initializeCart();
    
    
    setupContactForm();
    
    
    enhanceAccessibility();
});

let cart = [];
let cartTotal = 0;

function initializeCart() {
    
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    
    const savedCart = localStorage.getItem('jujutsuCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        
        cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
        updateCartDisplay();
    }
    
    setupAddToCartButtons();
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                alert('Checkout functionality coming soon! Your items have been saved.');
            }
        });
    }
}

function setupAddToCartButtons() {
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addButtons.forEach(button => {
        
        button.removeEventListener('click', handleAddToCart);
        
        button.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(event) {
    const button = event.target;
    const itemName = button.getAttribute('data-item');
    const itemPrice = parseFloat(button.getAttribute('data-price'));
    
    console.log('Adding to cart:', itemName, itemPrice);
    
    cart.push({ 
        name: itemName, 
        price: itemPrice 
    });
    
    cartTotal += itemPrice;
    
    localStorage.setItem('jujutsuCart', JSON.stringify(cart));
    
    updateCartDisplay();
    
    // Visual feedback on button
    const originalText = button.textContent;
    button.textContent = '✓ Added!';
    button.style.backgroundColor = '#388e3c';
    button.style.color = 'white';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
    }, 1500);
    
    
    announceToScreenReader(`${itemName} added to cart. Cart total is $${cartTotal.toFixed(2)}`);
    
    console.log('Cart updated:', cart); 
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cartTotal -= removedItem.price;
    cart.splice(index, 1);
    
    localStorage.setItem('jujutsuCart', JSON.stringify(cart));
    
    updateCartDisplay();
    
    announceToScreenReader(`${removedItem.name} removed from cart. Cart total is $${cartTotal.toFixed(2)}`);
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItems) {
        console.error('Cart items container not found!');
        return;
    }
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        // Show empty cart message
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        if (cartTotalElement) {
            cartTotalElement.textContent = '0';
        }
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
        }
    } else {
        
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }
        
        // Display each cart item
        cart.forEach((item, index) => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.setAttribute('role', 'listitem');
            
            cartItemDiv.innerHTML = `
                <span><strong>${item.name}</strong></span>
                <span>$${item.price.toFixed(2)}</span>
                <button class="remove-btn" 
                        data-index="${index}"
                        aria-label="Remove ${item.name} from cart">
                    Remove
                </button>
            `;
            
            cartItems.appendChild(cartItemDiv);
        });
        
        
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
        
        
        if (cartTotalElement) {
            cartTotalElement.textContent = cartTotal.toFixed(2);
        }
        
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
        }
    }
    
    console.log('Display updated. Cart has', cart.length, 'items'); // Debug line
}


function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    if (messageField && charCount) {
        messageField.addEventListener('input', function() {
            const remaining = 1000 - this.value.length;
            charCount.textContent = remaining;
            if (remaining < 100) {
                charCount.style.color = '#d32f2f';
            } else {
                charCount.style.color = '#666';
            }
        });
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
           
            contactForm.style.display = 'none';
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.style.display = 'block';
                successMessage.setAttribute('tabindex', '-1');
                successMessage.focus();
            }
            
            console.log('Form submitted successfully');
        }
    });
    
    const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateForm() {
    let isValid = true;
    
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    
    if (!validateField(fullName)) isValid = false;
    if (!validateField(email)) isValid = false;
    if (!validateField(message)) isValid = false;
    
    return isValid;
}

function validateField(field) {
    if (!field) return true;
    
    const errorElement = document.getElementById(field.id + 'Error');
    
    if (field.validity.valid && field.value.trim() !== '') {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        if (errorElement) errorElement.style.display = 'none';
        return true;
    } else {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errorElement) errorElement.style.display = 'block';
        return false;
    }
}
function enhanceAccessibility() {
    
    const skipLink = document.querySelector('.skip-nav');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        });
    }
}

function announceToScreenReader(message) {
    
    let liveRegion = document.getElementById('sr-announcements');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'sr-announcements';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }
    
    
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}