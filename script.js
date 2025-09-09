// AquaTech Pro - سباكة احترافية
// ======= CONFIG =======
const STORE_WHATSAPP_NUMBER = '201557609572'; // Egyptian number format
const CURRENCY = 'EGP';

// Debug info
console.log('Store WhatsApp Number:', STORE_WHATSAPP_NUMBER);
console.log('User Agent:', navigator.userAgent);

// Sample product catalog (edit as needed)
const PRODUCTS = [
  { 
        id: 'p1', 
        name: 'بكرة تفلون 50 متر حجم كبير ', 
        price:20, 
        category: 'أدوات', 
        img:'./img/20250909_125009.png',
        description: 'بكرة تفلون عالية الجودة 50 متر حجم كبير، مناسبة لجميع أعمال السباكة والتركيبات'
            },
              { 
        id: 'p2', 
        name: 'قلب حنفية /وخلاط 3.5 لنيه ايطالي ', 
        price: 25, 
        category: 'قطع غيار', 
        img: './img/20250909_124903.png',
        description: 'قلب حنفية إيطالي عالي الجودة 3.5 لنيه، مقاوم للتآكل ويدوم لفترة طويلة'
            },
      { 
        id: 'p3', 
        name: 'حنفية مطبخ ستانلس ستيل مع رشاش', 
        price: 35, 
        category: 'حنفيات', 
        img: './img/2.png',
        description: 'حنفية مطبخ فاخرة من الستانلس ستيل المقاوم للصدأ. مزودة برشاش قابل للسحب. تصميم عصري أنيق. سهلة التنظيف والصيانة. ضمان 5 سنوات من الشركة المصنعة.'
            },
            { 
        id: 'p4', 
        name: 'سيفون حمام كروم لامع', 
        price: 50, 
        category: 'قطع غيار', 
        img: './img/6.png',
        description: 'سيفون حمام من الكروم اللامع المقاوم للتآكل. تصميم أنيق يناسب الحمامات العصرية. سهل التنظيف والصيانة. مزود بصمام منع الروائح. تركيب سهل بدون أدوات خاصة.'
            },
            { 
        id: 'p5', 
        name: 'حنفية pg  smart copper نحاس بلدي', 
        price: 135, 
        category: 'حنفيات', 
        img:'./img/PG-CU.jpg',
        description: 'حنفية نحاس بكامل لا تصدأ القلب لا يتلف بيتغير له جوان "جلد حنفية بلدي"بضمان اسمرت كوبير '
            },
              { 
        id: 'p6', 
        name: 'حنفية pg  smart copper نحاس سكينة', 
        price: 110, 
        category: 'حنفيات', 
        img:'./img/PG-OR.jpg',
        description: 'حنفية نحاس بكامل لا تصدأ "سكينة لاكور نحاس " بضمان اسمرت كوبير '
            },
                    { 
        id: 'p7', 
        name: 'حنفية pg  smart copper نحاس سكينة', 
        price: 125, 
        category: 'حنفيات', 
        img:'./img/PG-RED.jpg',
        description: 'حنفية نحاس بكامل لا تصدأ "سكينة لاكور نحاس  ولاكور بلاستك احمر " بضمان اسمرت كوبير '
            },
        { 
        id: 'p8', 
        name: 'حنفية LAVOR  smart copper نحاس سكينة', 
        price: 70, 
        category: 'حنفيات', 
        img:'./img/LAVOR-B.jpg',
        description: 'حنفية نحاس بكامل لا تصدأ "سكينة لاكور  بلاستك وزن خفيف " بضمان اسمرت كوبير '
            },
                    { 
        id: 'p9', 
        name: 'حنفيةسكينة PVC بلاستك ابيض', 
        price: 45, 
        category: 'حنفيات', 
        img:'./img/PVC-W.png',
        description:' مع العمل ان الحنفيات البلاستك لاترد و لا تستبدل اليد بلاستك مدعومة بقطعة حديد حنفيةسكينة PVC بلاستك ابيض "بسن نحاس و الجسم PVC"' 
            },
                    { 
        id: 'p10', 
        name: 'حنفيةسكينة PVC بلاستك اسود', 
        price: 35, 
        category: 'حنفيات', 
        img:'./img/PVC-B.jpg',
        description:'مع العمل ان الحنفيات البلاستك لاترد و لا تستبدل  حنفيةسكينة PVC  اليد بلاستك بكامل  بلاستك اسود "بسن نحاس و الجسم PVC"' 
            },
                                { 
        id: 'p11', 
        name: 'حنفية ماكنية ضغط كنبنيشن FIRST ', 
        price: 35, 
        category: 'حنفيات', 
        img:'./img/FIRST.jpg',
        description:'حنفية ماكنية كنبنيشن FIRST مع العمل ان الحنفيات البلاستك لاترد و لا تستبدل'
                },
];

// ======= STATE =======
const cart = new Map(); // id -> { product, qty }
let currentFilter = 'all';
let searchTerm = '';
let currentPreviewProduct = null;

// ======= HELPERS =======
const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 }).format(n);

function getFilteredProducts() {
  return PRODUCTS.filter(product => {
    const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = currentFilter === 'all' || product.category === currentFilter;
    return matchesSearch && matchesFilter;
  });
}

function renderProducts() {
  const list = document.getElementById('products');
  list.innerHTML = '';
  const filteredProducts = getFilteredProducts();
  
  if (filteredProducts.length === 0) {
    list.innerHTML = `
      <div style="grid-column: span 12; text-align: center; padding: 40px; color: var(--muted);">
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <div>لم يتم العثور على منتجات</div>
        <div style="font-size: 14px; margin-top: 8px;">جرب كلمات بحث أخرى أو غير الفلتر</div>
      </div>
    `;
    return;
  }

  filteredProducts.forEach(p => {
    const el = document.createElement('article');
    el.className = 'product';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="body">
        <h3>${p.name}</h3>
        <div class="price">${fmt(p.price)}</div>
        <div class="controls">
          <div class="qty" data-id="${p.id}">
            <button type="button" aria-label="تقليل">−</button>
            <input type="number" min="1" value="1" inputmode="numeric" />
            <button type="button" aria-label="زيادة">+</button>
          </div>
          <button class="btn preview" data-id="${p.id}">👁️</button>
          <button class="btn add" data-id="${p.id}">أضف للسلة</button>
        </div>
      </div>
    `;
    list.appendChild(el);
  });

  // attach qty controls
  list.querySelectorAll('.qty').forEach(q => {
    const input = q.querySelector('input');
    q.children[0].addEventListener('click', () => { input.value = Math.max(1, (parseInt(input.value||'1',10)-1)); });
    q.children[2].addEventListener('click', () => { input.value = Math.max(1, (parseInt(input.value||'1',10)+1)); });
  });

  // add-to-cart handlers
  list.querySelectorAll('.btn.add').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const p = PRODUCTS.find(x => x.id === id);
      const qtyInput = btn.parentElement.querySelector('input');
      const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
      const existing = cart.get(id);
      cart.set(id, { product: p, qty: (existing?.qty || 0) + qty });
      renderCart();
      
      // Add animation effect
      btn.classList.add('animate-add');
      btn.textContent = 'تم الإضافة ✓';
      setTimeout(() => {
        btn.textContent = 'أضف للسلة';
        btn.classList.remove('animate-add');
      }, 1000);
    });
  });

  // preview handlers
  list.querySelectorAll('.btn.preview').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const product = PRODUCTS.find(x => x.id === id);
      if (product) {
        showProductPreview(product);
      }
    });
  });
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  const counter = document.getElementById('cart-counter');
  const clearBtn = document.getElementById('clear-cart');
  
  container.innerHTML = '';
  let subtotal = 0;
  let itemsCount = 0;

  if (cart.size === 0) {
    empty.style.display = 'block';
    summary.style.display = 'none';
    counter.style.display = 'none';
    clearBtn.style.display = 'none';
    document.getElementById('checkout-form').style.display = 'none';
    return;
  }
  
  empty.style.display = 'none';
  summary.style.display = 'block';
  counter.style.display = 'inline-block';
  clearBtn.style.display = 'inline-block';

  cart.forEach(({product, qty}) => {
    const line = product.price * qty;
    subtotal += line;
    itemsCount += qty;
    
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">${fmt(product.price)} × ${qty} = ${fmt(line)}</div>
      </div>
      <div class="cart-qty-controls">
        <button class="minus" data-id="${product.id}">−</button>
        <div class="cart-qty-display">${qty}</div>
        <button class="plus" data-id="${product.id}">+</button>
      </div>
      <button class="btn danger remove" data-id="${product.id}">حذف</button>
    `;
    container.appendChild(item);
  });

  // Update summary
  counter.textContent = itemsCount;
  document.getElementById('items-count').textContent = itemsCount;
  document.getElementById('subtotal').textContent = fmt(subtotal);
  document.getElementById('total-amount').textContent = fmt(subtotal);

  container.querySelectorAll('.minus').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-id');
      const entry = cart.get(id);
      if (!entry) return;
      entry.qty = Math.max(1, entry.qty - 1);
      cart.set(id, entry);
      renderCart();
    });
  });
  container.querySelectorAll('.plus').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-id');
      const entry = cart.get(id);
      if (!entry) return;
      entry.qty += 1;
      cart.set(id, entry);
      renderCart();
    });
  });
  container.querySelectorAll('.remove').forEach(b=>{
    b.addEventListener('click', ()=>{
      cart.delete(b.getAttribute('data-id'));
      renderCart();
    });
  });
}

function showCheckoutForm(show=true){
  document.getElementById('checkout-form').style.display = show ? '' : 'none';
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('form-ok').style.display = 'none';
}

function showProductPreview(product) {
  currentPreviewProduct = product;
  
  // Update modal content
  document.getElementById('preview-img').src = product.img;
  document.getElementById('preview-img').alt = product.name;
  document.getElementById('preview-cat').textContent = product.category;
  document.getElementById('preview-name').textContent = product.name;
  document.getElementById('preview-price').textContent = fmt(product.price);
  document.getElementById('preview-desc').textContent = product.description;
  document.getElementById('preview-quantity').value = 1;
  
  // Show modal
  document.getElementById('preview-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hideProductPreview() {
  document.getElementById('preview-modal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
  currentPreviewProduct = null;
}

function validateForm() {
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const location = document.getElementById('cust-location').value.trim();
  const termsAgreed = document.getElementById('terms-agree').checked;
  const errors = [];

  if (name.length < 2) errors.push('الرجاء إدخال اسمك الكامل.');
  
  // More flexible phone validation
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 8 || cleanPhone.length > 15) {
    errors.push('رقم الهاتف يجب أن يكون 8-15 رقم بالصيغة الدولية (مثال: 201001234567).');
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('الرجاء إدخال بريد إلكتروني صحيح أو اتركه فارغاً.');
  }

  if (location.length < 5) {
    errors.push('الرجاء إدخال الموقع بالتفصيل (المدينة، الحي، الشارع).');
  }

  if (!termsAgreed) {
    errors.push('يجب الموافقة على الشروط والأحكام قبل إتمام الطلب.');
  }

  return { valid: errors.length === 0, errors, name, phone: cleanPhone, email, location, termsAgreed };
}

function buildWhatsappMessage(customer, items) {
  const lines = [];
  lines.push(`🔧 *طلب جديد من AquaTech Pro*`);
  lines.push('');
  lines.push(`👤 *العميل*: ${customer.name}`);
  lines.push(`📞 *الهاتف*: ${customer.phone}`);
  if (customer.email) lines.push(`✉️ *البريد الإلكتروني*: ${customer.email}`);
  lines.push(`📍 *الموقع*: ${customer.location}`);
  lines.push('');
  lines.push(`🛠️ *المنتجات المطلوبة:*`);
  let total = 0;
  items.forEach(({product, qty})=>{
    const line = product.price * qty;
    total += line;
    lines.push(`• ${product.name} — ${qty} × ${product.price} ${CURRENCY} = ${line} ${CURRENCY}`);
    lines.push(`   الصورة: ${product.img}`);
  });
  lines.push('');
  lines.push(`💰 *إجمالي الطلب*: ${total} ${CURRENCY}`);
  lines.push('');
  lines.push(`🚚 *يرجى تأكيد التوفر ومواعيد التوصيل*`);
  lines.push(`🏠 *خدمة التركيب متوفرة عند الطلب*`);
  return lines.join('\n');
}

function openWhatsapp(message, toNumber) {
  // Clean and format the phone number
  const cleanNumber = toNumber.replace(/\D/g, ''); // Remove non-digits
  
  // Create WhatsApp URL
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  
  console.log('Opening WhatsApp with URL:', url); // Debug log
  
  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, open WhatsApp app directly
    window.location.href = url;
  } else {
    // On desktop, try to open in new window
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Fallback: use location.href
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Final fallback
      window.location.href = url;
    }
  }
}

// ======= EVENTS =======
function initializeEventListeners() {
  // Search functionality
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderProducts();
  });

  // Filter functionality
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      currentFilter = tag.getAttribute('data-category');
      renderProducts();
    });
  });

  document.getElementById('clear-cart').addEventListener('click', ()=>{
    cart.clear(); renderCart();
  });

  document.getElementById('checkout').addEventListener('click', ()=>{
    if (cart.size === 0) return;
    showCheckoutForm(true);
    document.getElementById('cust-name').focus();
  });

  document.getElementById('cancel-checkout').addEventListener('click', ()=>{
    showCheckoutForm(false);
  });

  // Preview modal events
  document.getElementById('close-preview').addEventListener('click', hideProductPreview);
  
  // Close modal when clicking overlay
  document.getElementById('preview-modal').addEventListener('click', (e) => {
    if (e.target.id === 'preview-modal') {
      hideProductPreview();
    }
  });

  // Preview quantity controls
  document.getElementById('preview-minus').addEventListener('click', () => {
    const input = document.getElementById('preview-quantity');
    input.value = Math.max(1, parseInt(input.value) - 1);
  });

  document.getElementById('preview-plus').addEventListener('click', () => {
    const input = document.getElementById('preview-quantity');
    input.value = parseInt(input.value) + 1;
  });

  // Add to cart from preview
  document.getElementById('preview-add-to-cart').addEventListener('click', () => {
    if (!currentPreviewProduct) return;
    
    const qty = parseInt(document.getElementById('preview-quantity').value);
    const existing = cart.get(currentPreviewProduct.id);
    cart.set(currentPreviewProduct.id, { 
      product: currentPreviewProduct, 
      qty: (existing?.qty || 0) + qty 
    });
    
    renderCart();
    hideProductPreview();
    
    // Show success message
    const btn = document.getElementById('preview-add-to-cart');
    const originalText = btn.textContent;
    btn.textContent = 'تمت الإضافة ✓';
    btn.style.background = '#16a34a';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 1000);
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideProductPreview();
    }
  });

  // Test WhatsApp button
  document.getElementById('test-whatsapp').addEventListener('click', ()=>{
    const testMessage = '🔧 مرحبا! هذه رسالة اختبار من AquaTech Pro - سباكة احترافية. ✅\n\nنحن جاهزون لخدمتكم!';
    console.log('=== WHATSAPP TEST ===');
    console.log('Testing WhatsApp with number:', STORE_WHATSAPP_NUMBER);
    console.log('Test message:', testMessage);
    console.log('User agent:', navigator.userAgent);
    
    try {
      openWhatsapp(testMessage, STORE_WHATSAPP_NUMBER);
      console.log('openWhatsapp function called successfully');
    } catch (error) {
      console.error('Error in test:', error);
      alert('خطأ في اختبار الواتساب: ' + error.message);
    }
  });

  document.getElementById('send-whatsapp').addEventListener('click', ()=>{
    const { valid, errors, name, phone, email } = validateForm();
    const errBox = document.getElementById('form-error');
    const okBox  = document.getElementById('form-ok');

    if (!valid) {
      errBox.textContent = errors.join(' ');
      errBox.style.display = '';
      okBox.style.display = 'none';
      return;
    }

    const items = Array.from(cart.values());
    const msg = buildWhatsappMessage({name, phone, email}, items);
    
    console.log('Sending WhatsApp message:', msg);
    console.log('Phone number used:', phone);
    
    // Show different message based on device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('Is mobile device:', isMobile);
    
    okBox.textContent = isMobile ? 'فتح تطبيق الواتساب...' : 'فتح واتساب ويب...';
    okBox.style.display = '';
    errBox.style.display = 'none';

    // Add small delay to show the message
    setTimeout(() => {
      try {
        openWhatsapp(msg, STORE_WHATSAPP_NUMBER);
      } catch (error) {
        console.error('Error in openWhatsapp:', error);
        errBox.textContent = 'حدث خطأ في فتح الواتساب: ' + error.message;
        errBox.style.display = '';
        okBox.style.display = 'none';
      }
    }, 500);
  });
}

// ======= INIT =======
function init() {
  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Initialize components
  renderProducts();
  renderCart();
  
  // Set up event listeners
  initializeEventListeners();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}