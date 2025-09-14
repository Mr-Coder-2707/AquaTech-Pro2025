    // ======= CONFIG =======
    const STORE_WHATSAPP_NUMBER = '201557609572'; // Egyptian number format
    const CURRENCY = 'EGP';

    // Debug info
    console.log('Store WhatsApp Number:', STORE_WHATSAPP_NUMBER);
    console.log('User Agent:', navigator.userAgent);

    // Product catalog - will be loaded from JSON file
    let PRODUCTS = [];

    // ======= PRODUCT DATA LOADING =======
    async function loadProducts() {
      try {
        console.log('Loading products from JSON file...');
        const response = await fetch('./products-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        PRODUCTS = data.products;
        console.log(`Loaded ${PRODUCTS.length} products successfully`);
        return true;
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback: show error message to user
        showLoadingError('فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.');
        return false;
      }
    }

    function showLoadingError(message) {
      const productsList = document.getElementById('products');
      if (productsList) {
        productsList.innerHTML = `
          <div style="grid-column: span 12; text-align: center; padding: 40px; color: var(--danger);">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 18px; margin-bottom: 16px;">${message}</div>
            <button onclick="location.reload()" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
              إعادة تحميل الصفحة
            </button>
          </div>
        `;
      }
    }
    // ======= STATE =======
    const cart = new Map(); // id -> { product, qty }
    let currentFilter = 'all';
    let searchTerm = '';
    let currentPreviewProduct = null;

    // ======= HELPERS =======
    const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 }).format(n);

    function saveCart() {
      try {
        const cartData = [];
        cart.forEach((value, key) => {
          cartData.push({
            id: key,
            product: value.product,
            qty: value.qty
          });
        });
        localStorage.setItem('aquatech_cart', JSON.stringify(cartData));
        console.log('Cart saved to localStorage:', cartData);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }

    function loadCart() {
      try {
        const savedCart = localStorage.getItem('aquatech_cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          cart.clear();
          cartData.forEach(item => {
            cart.set(item.id, {
              product: item.product,
              qty: item.qty
            });
          });
          console.log('Cart loaded from localStorage:', cartData);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart.clear(); // Clear cart if there's an error loading
      }
    }

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
          <img src="${p.img}" alt="${p.name}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;">
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
          renderCart(); // This will automatically save the cart
          
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
        updateFloatingCart(0);
        saveCart(); // حفظ السلة حتى لو كانت فارغة
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
          <img src="${product.img}" alt="${product.name}" loading="lazy" style="width: 60px; height: 60px; object-fit: cover;">
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

      // Update floating cart button
      updateFloatingCart(itemsCount);

      // حفظ السلة في localStorage
      saveCart();

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
      lines.push(`📦 *طلب جديد من AquaTech Pro*`);
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

    function updateFloatingCart(itemsCount) {
      const floatingCart = document.getElementById('floating-cart');
      const floatingBadge = document.getElementById('floating-cart-badge');
      
      if (itemsCount > 0) {
        floatingCart.classList.add('visible');
        floatingBadge.textContent = itemsCount;
        floatingBadge.style.display = 'flex';
      } else {
        floatingCart.classList.remove('visible');
        floatingBadge.style.display = 'none';
      }
    }

    function scrollToCart() {
      const cartSection = document.querySelector('.cart');
      cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ======= EVENTS =======
    // Floating cart button
    document.getElementById('floating-cart').addEventListener('click', scrollToCart);

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
      cart.clear(); 
      renderCart(); // This will automatically save the empty cart
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
      
      renderCart(); // This will automatically save the cart
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
      const { valid, errors, name, phone, email, location } = validateForm();
      const errBox = document.getElementById('form-error');
      const okBox  = document.getElementById('form-ok');

      if (!valid) {
        errBox.textContent = errors.join(' ');
        errBox.style.display = '';
        okBox.style.display = 'none';
        return;
      }

      const items = Array.from(cart.values());
      const msg = buildWhatsappMessage({name, phone, email, location}, items);
      
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

    // ======= LOADING SCREEN =======
    let loadingProgress = 0;
    
    function updateProgress(percentage) {
      loadingProgress = Math.min(100, Math.max(0, percentage));
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      
      if (progressBar) {
        progressBar.style.width = loadingProgress + '%';
      }
      if (progressText) {
        progressText.textContent = Math.round(loadingProgress) + '%';
      }
    }
    
    function simulateProgressLoading() {
      let progress = 0;
      const steps = [
        { target: 20, message: 'تحميل الملفات الأساسية...' },
        { target: 40, message: 'تحضير المنتجات...' },
        { target: 65, message: 'تحميل البيانات...' },
        { target: 85, message: 'تهيئة المتجر...' },
        { target: 100, message: 'أشوي كده وخلاص...' }
      ];
      
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          progress += 2;
          
          if (progress >= step.target) {
            progress = step.target;
            updateLoadingText(step.message);
            currentStep++;
          }
          
          updateProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(hideLoadingScreen, 500);
          }
        }
      }, 100);
    }

    function hideLoadingScreen() {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          document.body.style.overflow = 'auto'; // إعادة تفعيل التمرير
          document.body.classList.add('loaded'); // إضافة class للـ body
          
          // إضافة تأثير انطلاق لطيف للمحتوى
          const header = document.querySelector('header');
          const main = document.querySelector('main');
          const nav = document.querySelector('nav');
          
          if (header) {
            header.style.animation = 'slideInFromTop 0.6s ease-out';
          }
          if (nav) {
            nav.style.animation = 'slideInFromLeft 0.6s ease-out 0.2s both';
          }
          if (main) {
            main.style.animation = 'fadeInUp 0.8s ease-out 0.4s both';
          }
        }, 800);
      }
    }

    // تحديث نص التحميل
    function updateLoadingText(message) {
      const loadingTextElement = document.querySelector('#loading-screen p:last-of-type');
      if (loadingTextElement && loadingTextElement.previousElementSibling.classList.contains('loading-dots')) {
        loadingTextElement.textContent = message || 'جاري تحميل الموقع...';
      }
    }

    // ======= INIT =======
    document.addEventListener('DOMContentLoaded', async function() {
      document.getElementById('year').textContent = new Date().getFullYear();
      
      // تحميل السلة المحفوظة من localStorage
      loadCart();
      
      // بدء محاكاة شريط التقدم
      setTimeout(() => {
        simulateProgressLoading();
      }, 1000);
      
      // تحميل البيانات والمحتوى
      try {
        // تحميل المنتجات من ملف JSON
        const productsLoaded = await loadProducts();
        
        if (productsLoaded) {
          renderProducts();
          renderCart();
        } else {
          // في حالة فشل التحميل، سيتم عرض رسالة الخطأ من خلال showLoadingError
          setTimeout(hideLoadingScreen, 1000);
          return;
        }
        
      } catch (error) {
        console.error('خطأ في تحميل المحتوى:', error);
        showLoadingError('حدث خطأ في تحميل المحتوى. يرجى المحاولة مرة أخرى.');
        // إخفاء شاشة التحميل حتى في حالة الخطأ
        setTimeout(hideLoadingScreen, 1000);
      }
    });

    // إخفاء شاشة التحميل عند اكتمال تحميل جميع الموارد
    window.addEventListener('load', function() {
      // التأكد من تحميل جميع الصور
      const images = document.querySelectorAll('img');
      let loadedImages = 0;
      const totalImages = images.length;
      
      if (totalImages === 0) {
        return; // دع شريط التقدم يكمل طبيعياً
      }
      
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            // تحديث التقدم بناءً على تحميل الصور
            const imageProgress = (loadedImages / totalImages) * 20; // 20% للصور
            if (loadingProgress < 80) {
              updateProgress(Math.max(loadingProgress, 60 + imageProgress));
            }
          });
          
          img.addEventListener('error', () => {
            loadedImages++;
            const imageProgress = (loadedImages / totalImages) * 20;
            if (loadingProgress < 80) {
              updateProgress(Math.max(loadingProgress, 60 + imageProgress));
            }
          });
        }
      });
      
      if (loadedImages === totalImages && loadingProgress < 80) {
        updateProgress(80);
      }
    });
