import SetGeolocation from "./SetGeolocation";

class Message {
  constructor(container) {
    this.position =
      JSON.parse(sessionStorage.getItem("position")) || this.pos();
    this.messages = [
      {
        type: "text",
        value: "first message",
        pos: [11, 12],
        createTime: 1688988866635,
      },
    ];
    this.container = container;
    this.getMessages();
    this.newMessage();
  }

  async pos() {
    const geolocation = new SetGeolocation();
    try {
      const pos = await geolocation.getLocation();
      sessionStorage.setItem("position", JSON.stringify(pos));
    } catch (err) {
      if (err.code !== 1) return console.log(err);
      geolocation.getModal();
    }
  }

  getMessages() {
    this.messages.forEach((message) => this.addMessage(message));
  }

  addMessage(message) {
    const item = document.createElement("div");
    item.className = "chat__item";
    item.innerHTML = `<time class="chat__time">${new Date(
      message.createTime
    ).toLocaleString()}</time>
        ${this.getTypesMessage(message)}
        <span class="chat__position">[${message.pos[0]}, ${
      message.pos[1]
    }]</span>`;
    this.getTypesMessage(message);
    this.container.prepend(item);
  }

  newMessage() {
    const input = document.querySelector(".chat__input input");
    const audioRecord = document.querySelector(".audio-record");
    const videoRecord = document.querySelector(".video-record");

    input.addEventListener("keydown", (event) => {
      this.addTextMessage(event, input);
    });

    audioRecord.addEventListener("click", async () => {
      this.addAudioMessage(audioRecord);
    });

    videoRecord.addEventListener("click", async () => {
      this.addVidioMessage(videoRecord);
    });
  }

  addTextMessage(event, input) {
    if (
      event.code !== "Enter" ||
      !input.value.trim() ||
      !this.position.isLocation
    )
      return;
    const message = {
      type: "text",
      value: input.value,
      pos: [this.position.latitude, this.position.longitude],
      createTime: Date.now(),
    };
    this.messages.push(message);
    input.value = "";
    this.addMessage(message);
  }

  async addAudioMessage(audioRecord) {
    if (!this.position.isLocation) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    this.newRecorder(stream, audioRecord, "video");
  }

  async addVidioMessage(videoRecord) {
    if (!this.position.isLocation) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    this.newRecorder(stream, videoRecord, "video");
  }

  newRecorder(stream, record, type) {
    const recorder = new MediaRecorder(stream);
    const changs = [];

    recorder.addEventListener("dataavailable", (event) => {
      changs.push(event.data);
    });

    recorder.addEventListener("stop", () => {
      const blob = new Blob(changs);
      const message = {
        type: type,
        value: URL.createObjectURL(blob),
        pos: [this.position.latitude, this.position.longitude],
        createTime: Date.now(),
      };
      this.messages.push(message);

      this.addMessage(message);
    });

    recorder.start();

    const stopRec = document.createElement("button");
    stopRec.className = "stop-record";
    record.replaceWith(stopRec);

    stopRec.addEventListener("mouseup", () => {
      recorder.stop();
      stream.getTracks().forEach((track) => track.stop());
      stopRec.replaceWith(record);
    });
  }

  getTypesMessage(message) {
    const mes = {
      text: () => `<span class="chat__text">${message.value}</span>`,
      audio: () =>
        `<audio class="audio" src=${message.value} controls></audio>`,
      video: () =>
        `<video class="video" src=${message.value} width="250" controls></video>`,
    };
    return mes[message.type]();
  }
}

export default Message;
