let selectedProduct = "";

async function loadProducts() {
    try {
        const response = await fetch("products.json");
        const products = await response.json();
        const container = document.getElementById("productsContainer");

        products.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.className = "product";

            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;">
                <h2>${product.name}</h2>
                <p>Price: $${product.price}</p>
                <button class="buy-button" data-product="${product.name}" data-image="${product.image}">
                    Buy Now
                </button>
            `;
            container.appendChild(productDiv);
        });

        addBuyButtonEvents();
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function addBuyButtonEvents() {
    const buyButtons = document.querySelectorAll(".buy-button");

    buyButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedProduct = button.getAttribute("data-product");
            document.getElementById("orderForm").style.display = "flex";
        });
    });
}

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("orderForm").style.display = "none";
});

document.getElementById("detailsForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const location = document.getElementById("location").value;

  const message = `
Hello, I want to buy the following product:
- Product: ${selectedProduct}
- Name: ${name}
- Phone: ${phone}
- Email: ${email}
- Location: ${location}
  `;

  // ترميز الرسالة بالكامل
  const whatsappUrl = `https://wa.me/201500272762?text=${encodeURIComponent(message.trim())}`;
  window.open(whatsappUrl, "_blank");

  document.getElementById("orderForm").style.display = "none";
  document.getElementById("detailsForm").reset();
});


window.onload = () => {
    loadProducts();
};

