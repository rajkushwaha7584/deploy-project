(() => {
  const content = window.SITE_CONTENT || {};
  const phone = content.phoneDisplay || "+91 70004 11604";
  const email = content.email || "hello@riddhisiddhienterprises.in";
  document.querySelectorAll("[data-phone]").forEach(el => el.textContent = phone);
  document.querySelectorAll("[data-phone-link]").forEach(el => el.href = `tel:${content.phoneDial || phone.replace(/\s/g, "")}`);
  document.querySelectorAll("[data-email]").forEach(el => el.textContent = email);
  document.querySelectorAll("[data-email-link]").forEach(el => el.href = `mailto:${email}`);
  document.querySelector("#year").textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); document.body.classList.remove("menu-open");
  }));

  let rating = "";
  const stars = [...document.querySelectorAll(".rating button")];
  stars.forEach(star => star.addEventListener("click", () => {
    rating = star.dataset.rating;
    document.querySelector('[name="rating"]').value = rating;
    stars.forEach(item => item.classList.toggle("selected", Number(item.dataset.rating) <= Number(rating)));
  }));

  document.querySelectorAll(".email-form").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const isFeedback = form.dataset.form === "feedback";
    const subject = isFeedback ? "Website feedback" : `Website enquiry: ${data.get("topic")}`;
    const lines = isFeedback
      ? [`Feedback from: ${data.get("name") || "Not provided"}`, `Rating: ${data.get("rating") || "Not provided"} / 5`, "", data.get("message")]
      : [`Name: ${data.get("name")}`, `Phone: ${data.get("phone") || "Not provided"}`, `Interested in: ${data.get("topic")}`, "", data.get("message") || "No additional details."];
    const href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    form.querySelector(".form-status").textContent = "Your email app is opening with your message ready to send.";
    window.location.href = href;
  }));
})();
