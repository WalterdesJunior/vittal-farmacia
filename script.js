const WHATSAPP_NUMBER = "5586999999999";

/* ---------- Menu mobile ---------- */
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const mobileNavOverlay = document.getElementById("mobileNavOverlay");
const mobileNavClose = document.getElementById("mobileNavClose");

function openMobileNav() {
  mobileNav.classList.add("open");
  mobileNavOverlay.classList.add("open");
  menuToggle.setAttribute("aria-expanded", "true");
  mobileNav.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeMobileNav() {
  mobileNav.classList.remove("open");
  mobileNavOverlay.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  mobileNav.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (menuToggle && mobileNav && mobileNavOverlay) {
  menuToggle.addEventListener("click", () => {
    mobileNav.classList.contains("open") ? closeMobileNav() : openMobileNav();
  });
  mobileNavOverlay.addEventListener("click", closeMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener("click", closeMobileNav);
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMobileNav));
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMobileNav();
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", e => {
    if (e.matches) closeMobileNav();
  });
}

/* ---------- Carrinho ---------- */
const CART_KEY = "vittal_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parsePrice(text) {
  const digits = text.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(digits) || 0;
}

function formatBRL(value) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

function extractProductFromEl(article) {
  const h3 = article.querySelector(".product-body h3");
  const p = article.querySelector(".product-body p");
  const priceEl = article.querySelector(".product-body div strong");
  const imgEl = article.querySelector(".product-image");
  let image = "";
  if (imgEl) {
    const bg = getComputedStyle(imgEl).backgroundImage;
    const match = bg.match(/url\(["']?(.*?)["']?\)/);
    if (match && match[1] !== "none") image = match[1];
  }
  const name = h3 ? h3.textContent.trim() : "Produto";
  return {
    id: slugify(name),
    name,
    subtitle: p ? p.textContent.trim() : "",
    price: priceEl ? parsePrice(priceEl.textContent) : 0,
    image
  };
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.qty * i.price, 0);
}

let lastCartCount = cartCount();

function updateCartBadge() {
  const count = cartCount();
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  const fab = document.getElementById("cartFab");
  if (fab) {
    const fabBadge = document.getElementById("cartFabBadge");
    if (fabBadge) fabBadge.textContent = count > 99 ? "99+" : count;
    fab.classList.toggle("visible", count > 0);
    if (count > lastCartCount) {
      fab.classList.remove("bump");
      void fab.offsetWidth;
      fab.classList.add("bump");
    }
  }
  lastCartCount = count;
}

updateCartBadge();

/* ---------- Busca ---------- */
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function runSearch() {
  const value = searchInput.value.trim();
  if (!value) {
    searchInput.focus();
    return;
  }
  window.location.href = `categorias.html?q=${encodeURIComponent(value)}`;
}

searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});

/* ---------- Botões "Adicionar" ---------- */
document.querySelectorAll(".product-body button").forEach(button => {
  button.addEventListener("click", () => {
    const article = button.closest(".product");
    if (article) {
      addToCart(extractProductFromEl(article), 1);
    }
    const original = button.textContent;
    button.textContent = "Adicionado ✓";
    button.style.background = "#d95b08";
    setTimeout(() => {
      button.textContent = original;
      button.style.background = "";
    }, 1200);
  });
});

const slides = document.querySelectorAll(".dots i");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
let current = 0;
function setSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((dot, i) => dot.classList.toggle("selected", i === current));
}
if (nextBtn && prevBtn && slides.length) {
  nextBtn.addEventListener("click", () => setSlide(current + 1));
  prevBtn.addEventListener("click", () => setSlide(current - 1));
  setInterval(() => setSlide(current + 1), 6000);
}

const catLinks = document.querySelectorAll(".cat-sidebar a");
const catProducts = document.querySelectorAll(".cat-products .product");
const catHeading = document.getElementById("catHeading");
const catTitle = catHeading ? catHeading.firstChild : null;
const catCount = document.getElementById("catCount");
const catNames = {
  all: "Todos os produtos",
  medicamentos: "Medicamentos",
  manipulados: "Manipulados",
  dermocosmeticos: "Dermocosméticos",
  vitaminas: "Vitaminas e Suplementos",
  pet: "Pet",
  higiene: "Higiene e Beleza",
  "mae-bebe": "Mãe e Bebê",
  aparelhos: "Aparelhos e Acessórios"
};

function applyCatFilter(cat) {
  if (!catNames[cat]) cat = "all";
  catLinks.forEach(a => a.classList.toggle("active", a.dataset.cat === cat));
  let visible = 0;
  catProducts.forEach(p => {
    const show = cat === "all" || p.dataset.cat === cat;
    p.style.display = show ? "" : "none";
    if (show) visible++;
  });
  if (catTitle) catTitle.textContent = catNames[cat];
  if (catCount) catCount.textContent = `${visible} produto${visible === 1 ? "" : "s"}`;
}

function applySearchFilter(query) {
  catLinks.forEach(a => a.classList.remove("active"));
  const q = query.toLowerCase();
  let visible = 0;
  catProducts.forEach(p => {
    const name = p.querySelector("h3")?.textContent.toLowerCase() || "";
    const show = name.includes(q);
    p.style.display = show ? "" : "none";
    if (show) visible++;
  });
  if (catTitle) catTitle.textContent = `Resultados para "${query}"`;
  if (catCount) catCount.textContent = `${visible} produto${visible === 1 ? "" : "s"}`;
}

if (catLinks.length) {
  catLinks.forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const cat = a.dataset.cat;
      history.replaceState(null, "", cat === "all" ? location.pathname : `#${cat}`);
      applyCatFilter(cat);
    });
  });
  const searchQuery = new URLSearchParams(location.search).get("q");
  if (searchQuery) {
    if (searchInput) searchInput.value = searchQuery;
    applySearchFilter(searchQuery);
  } else {
    applyCatFilter(location.hash ? location.hash.slice(1) : "all");
  }
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    const button = contactForm.querySelector("button[type=submit]");
    const original = button.textContent;
    button.textContent = "Mensagem enviada ✓";
    button.disabled = true;
    button.style.background = "#2e8b3e";
    setTimeout(() => {
      button.textContent = original;
      button.style.background = "";
      button.disabled = false;
      contactForm.reset();
    }, 2200);
  });
}

/* ---------- Página do carrinho ---------- */
const cartItemsEl = document.getElementById("cartItems");
if (cartItemsEl) {
  const cartEmptyEl = document.getElementById("cartEmpty");
  const cartFilledEl = document.getElementById("cartFilled");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  const shippingNoteEl = document.getElementById("cartShippingNote");
  const FREE_SHIPPING_THRESHOLD = 150;

  function trashIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/><path d="m6 7 1 13.4A1.6 1.6 0 0 0 8.6 22h6.8a1.6 1.6 0 0 0 1.6-1.6L18 7"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
  }

  function renderCart() {
    const cart = getCart();
    if (!cart.length) {
      cartEmptyEl.hidden = false;
      cartFilledEl.hidden = true;
      return;
    }
    cartEmptyEl.hidden = true;
    cartFilledEl.hidden = false;

    cartItemsEl.innerHTML = cart.map(item => `
      <tr data-id="${item.id}">
        <td class="cart-product">
          <div class="cart-thumb"${item.image ? ` style="background-image:url('${item.image}')"` : ""}>${item.image ? "" : `<span>${item.name.charAt(0)}</span>`}</div>
          <div><b>${item.name}</b><span>${item.subtitle}</span></div>
        </td>
        <td>
          <div class="qty-stepper">
            <button class="qty-minus" aria-label="Diminuir quantidade">−</button>
            <span>${item.qty}</span>
            <button class="qty-plus" aria-label="Aumentar quantidade">+</button>
          </div>
        </td>
        <td class="cart-price">${formatBRL(item.price * item.qty)}</td>
        <td><button class="cart-remove" aria-label="Remover item">${trashIcon()}</button></td>
      </tr>
    `).join("");

    const total = cartTotal();
    subtotalEl.textContent = formatBRL(total);
    totalEl.textContent = formatBRL(total);

    if (total >= FREE_SHIPPING_THRESHOLD) {
      shippingNoteEl.textContent = "Frete grátis liberado neste pedido! 🎉";
    } else {
      shippingNoteEl.textContent = `Frete grátis para compras acima de ${formatBRL(FREE_SHIPPING_THRESHOLD)} — faltam ${formatBRL(FREE_SHIPPING_THRESHOLD - total)}`;
    }
  }

  cartItemsEl.addEventListener("click", e => {
    const row = e.target.closest("tr");
    if (!row) return;
    const id = row.dataset.id;
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (e.target.closest(".qty-plus")) {
      item.qty++;
      saveCart(cart);
      renderCart();
    } else if (e.target.closest(".qty-minus")) {
      if (item.qty <= 1) {
        removeFromCart(id);
      } else {
        item.qty--;
        saveCart(cart);
      }
      renderCart();
    } else if (e.target.closest(".cart-remove")) {
      removeFromCart(id);
      renderCart();
    }
  });

  renderCart();

  /* ---------- Etapas: Carrinho -> Endereço -> Pagamento ---------- */
  const CHECKOUT_KEY = "vittal_checkout";
  const STORE_CITY = "teresina";
  const STORE_UF = "pi";

  function getCheckoutData() {
    try {
      return JSON.parse(localStorage.getItem(CHECKOUT_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveCheckoutData(data) {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(data));
  }

  const stepButtons = document.querySelectorAll(".cart-step");
  const panelCart = document.getElementById("panelCart");
  const panelAddress = document.getElementById("panelAddress");
  const panelPayment = document.getElementById("panelPayment");
  const pageTitleEl = document.getElementById("cartPageTitle");
  const continueShoppingLink = document.getElementById("continueShoppingLink");
  const stepTitles = { 1: "Seu carrinho", 2: "Endereço de entrega", 3: "Forma de pagamento" };
  let maxStepReached = 1;

  function goToStep(step) {
    if (step > maxStepReached) return;
    panelCart.hidden = step !== 1;
    panelAddress.hidden = step !== 2;
    panelPayment.hidden = step !== 3;
    pageTitleEl.textContent = stepTitles[step];
    continueShoppingLink.style.visibility = step === 1 ? "visible" : "hidden";
    stepButtons.forEach(btn => {
      const s = Number(btn.dataset.step);
      btn.classList.toggle("active", s === step);
      btn.disabled = s > maxStepReached;
    });
    if (step === 3) renderOrderReview();
    document.querySelector(".cart-page").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  stepButtons.forEach(btn => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.step)));
  });

  const toAddressBtn = document.getElementById("toAddressBtn");
  if (toAddressBtn) {
    toAddressBtn.addEventListener("click", () => {
      if (!getCart().length) return;
      maxStepReached = Math.max(maxStepReached, 2);
      goToStep(2);
    });
  }

  /* CEP -> busca endereço via ViaCEP */
  const cepInput = document.getElementById("addrCep");
  const addressStatus = document.getElementById("addressStatus");
  const ruaInput = document.getElementById("addrRua");
  const numeroInput = document.getElementById("addrNumero");
  const bairroInput = document.getElementById("addrBairro");
  const cidadeInput = document.getElementById("addrCidade");
  const ufInput = document.getElementById("addrUf");
  const refInput = document.getElementById("addrRef");
  const shippingBox = document.getElementById("shippingBox");
  const shippingLabelEl = document.getElementById("shippingLabel");
  const shippingPriceEl = document.getElementById("shippingPrice");

  if (cepInput) {
    cepInput.addEventListener("input", () => {
      cepInput.value = cepInput.value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
    });

    cepInput.addEventListener("blur", async () => {
      const cep = cepInput.value.replace(/\D/g, "");
      if (cep.length !== 8) return;
      addressStatus.textContent = "Buscando endereço...";
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (data.erro) {
          addressStatus.textContent = "CEP não encontrado — preencha o endereço manualmente.";
          return;
        }
        ruaInput.value = data.logradouro || ruaInput.value;
        bairroInput.value = data.bairro || bairroInput.value;
        cidadeInput.value = data.localidade || "";
        ufInput.value = data.uf || "";
        addressStatus.textContent = "Endereço encontrado!";
        numeroInput.focus();
        calculateShipping();
      } catch {
        addressStatus.textContent = "Não foi possível buscar o CEP — preencha o endereço manualmente.";
      }
    });
  }

  function calculateShipping() {
    const cidade = (cidadeInput.value || "").trim().toLowerCase();
    const uf = (ufInput.value || "").trim().toLowerCase();
    if (!uf) {
      shippingBox.hidden = true;
      return null;
    }
    const subtotal = cartTotal();
    let price, label;
    if (subtotal >= 150) {
      price = 0;
      label = "Frete grátis (compra acima de R$ 150,00)";
    } else if (cidade === STORE_CITY && uf === STORE_UF) {
      price = 9.9;
      label = "Entrega local em Teresina";
    } else if (uf === STORE_UF) {
      price = 19.9;
      label = `Entrega para ${cidadeInput.value.trim()} - PI`;
    } else {
      price = 29.9;
      label = "Entrega para fora do estado";
    }
    shippingBox.hidden = false;
    shippingLabelEl.textContent = label;
    shippingPriceEl.textContent = price === 0 ? "Grátis" : formatBRL(price);
    return { price, label };
  }

  [cidadeInput, ufInput].forEach(el => {
    if (!el) return;
    el.addEventListener("input", calculateShipping);
    el.addEventListener("blur", calculateShipping);
  });

  const backToCartBtn = document.getElementById("backToCartBtn");
  if (backToCartBtn) backToCartBtn.addEventListener("click", () => goToStep(1));

  const toPaymentBtn = document.getElementById("toPaymentBtn");
  if (toPaymentBtn) {
    toPaymentBtn.addEventListener("click", () => {
      const required = [ruaInput, numeroInput, bairroInput, cidadeInput, ufInput];
      const missing = required.find(el => !el.value.trim());
      if (missing) {
        addressStatus.textContent = "Preencha todos os campos obrigatórios do endereço.";
        missing.focus();
        return;
      }
      const shipping = calculateShipping();
      if (!shipping) {
        addressStatus.textContent = "Não foi possível calcular o frete — confira a UF.";
        return;
      }
      saveCheckoutData({
        ...getCheckoutData(),
        address: {
          cep: cepInput.value.trim(),
          rua: ruaInput.value.trim(),
          numero: numeroInput.value.trim(),
          complemento: document.getElementById("addrComplemento").value.trim(),
          bairro: bairroInput.value.trim(),
          cidade: cidadeInput.value.trim(),
          uf: ufInput.value.trim().toUpperCase(),
          referencia: refInput.value.trim(),
          shipping
        }
      });
      maxStepReached = Math.max(maxStepReached, 3);
      goToStep(3);
    });
  }

  const backToAddressBtn = document.getElementById("backToAddressBtn");
  if (backToAddressBtn) backToAddressBtn.addEventListener("click", () => goToStep(2));

  function renderOrderReview() {
    const cart = getCart();
    const { address } = getCheckoutData();
    if (!address) return;
    const reviewEl = document.getElementById("orderReview");
    const subtotal = cartTotal();
    const shipping = address.shipping ? address.shipping.price : 0;
    const total = subtotal + shipping;
    const enderecoCompleto = `${address.rua}, ${address.numero}${address.complemento ? " - " + address.complemento : ""} — ${address.bairro}, ${address.cidade}/${address.uf}${address.cep ? " · CEP " + address.cep : ""}`;
    reviewEl.innerHTML = `
      <h4>Resumo do pedido</h4>
      ${cart.map(i => `<div class="order-review-item"><span>${i.qty}x ${i.name}</span><span>${formatBRL(i.price * i.qty)}</span></div>`).join("")}
      <div class="order-review-row"><span>Subtotal</span><span>${formatBRL(subtotal)}</span></div>
      <div class="order-review-row"><span>Frete</span><span>${shipping === 0 ? "Grátis" : formatBRL(shipping)}</span></div>
      <div class="order-review-total"><span>Total</span><strong>${formatBRL(total)}</strong></div>
      <div class="order-review-address"><b>Entregar em:</b> ${enderecoCompleto}</div>
    `;
  }

  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const paymentStatus = document.getElementById("paymentStatus");
  const finishBtn = document.getElementById("finishOrder");

  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      const selected = document.querySelector('input[name="payment"]:checked');
      if (!selected) {
        paymentStatus.textContent = "Selecione uma forma de pagamento para continuar.";
        return;
      }
      const paymentLabels = { pix: "Pix", cartao: "Cartão (na entrega)", dinheiro: "Dinheiro (na entrega)" };
      const cart = getCart();
      const { address } = getCheckoutData();
      const subtotal = cartTotal();
      const shipping = address.shipping ? address.shipping.price : 0;
      const total = subtotal + shipping;
      const enderecoCompleto = `${address.rua}, ${address.numero}${address.complemento ? " - " + address.complemento : ""} — ${address.bairro}, ${address.cidade}/${address.uf}${address.cep ? " (CEP " + address.cep + ")" : ""}`;
      const lines = cart.map(item => `• ${item.qty}x ${item.name} — ${formatBRL(item.price * item.qty)}`);
      const msgParts = [
        "Olá! Gostaria de finalizar meu pedido:",
        "",
        ...lines,
        "",
        `Subtotal: ${formatBRL(subtotal)}`,
        `Frete (${address.shipping.label}): ${shipping === 0 ? "Grátis" : formatBRL(shipping)}`,
        `*Total: ${formatBRL(total)}*`,
        "",
        `Endereço de entrega: ${enderecoCompleto}`,
        address.referencia ? `Referência: ${address.referencia}` : null,
        `Forma de pagamento: ${paymentLabels[selected.value]}`
      ].filter(Boolean);
      const msg = msgParts.join("\n");
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }
}

const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(el => revealObserver.observe(el));
  }
}
