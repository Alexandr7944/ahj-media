class SetGeolocation {
  async getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          isLocation: true,
          latitude,
          longitude,
        });
      }, reject);
    });
  }

  getModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = this.modalHTML();
    document.body.append(modal);

    modal.addEventListener("click", (event) => {
      const { target } = event;

      if (target.classList.contains("modal__reset")) {
        return modal.remove();
      }

      if (target.classList.contains("modal__ok")) {
        let input = modal.querySelector(".modal__input");
        const { value } = input;
        // input.value = "";

        const pos = this.isPosition(value);
        if (!pos.isLocation) {
          input.value = "Неверные значения";
          input.addEventListener("focus", () => (input.value = ""), {
            once: true,
          });
          return;
        }
        modal.remove();
        sessionStorage.setItem("position", JSON.stringify(pos));
      }
    });

    return { isLocation: false };
  }

  modalHTML() {
    return `
      <div class="modal__container">
        <p class="modal__text">Что-то пошло не так</p>
        <p class="modal__text">К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.</p>
        <p class="modal__text">Широта и долгота через запятую</p>
        <input class="modal__input" type="text">
        <div class="modal__buttons">
          <button class="modal__reset">Отмена</button>
          <button class="modal__ok">OK</button>
        </div>
      </div>
    `;
  }

  isPosition(text) {
    let result = { isLocation: false };
    let arr = text.match(
      /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g
    );
    if (!arr) return result;

    arr = arr.join().split(", ").map(Number);
    if (arr.length !== 2) return result;
    return {
      isLocation: true,
      latitude: arr[0],
      longitude: arr[1],
    };
  }
}

export default SetGeolocation;
