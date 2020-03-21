<template>
  <div>
    <v-flex v-if="config!= null">
      <v-container>
        {{my.id}}
        <v-flex>
          <v-img :src="frame"></v-img>
        </v-flex>
        <v-flex>
          <v-container>
            <v-slider
              v-model="config.interval"
              min="100"
              max="1000"
              @change="changeSettings()"
              :label="'Intervalo ('+config.interval+ 'ms)'"
            ></v-slider>
            <v-slider
              v-model="config.quality"
              @change="changeSettings()"
              min="20"
              max="100"
              :label="'Qualidade ('+config.quality+ '%)'"
            ></v-slider>
            <v-flex></v-flex>
          </v-container>
        </v-flex>
      </v-container>
    </v-flex>
  </div>
</template>

<script>
export default {
  data() {
    return {
      my: {
        name: "",
        id: ""
      },
      socket: null,
      wsUrl: null,
      config: null,
      frame: "https://picsum.photos/200",
      interval: 500
    };
  },
  mounted() {
    this.wsUrl = window.location.href
      .replace("http", "ws")
      .replace("3000/", "3001");
    this.startSockets();
  },
  methods: {
    encode(input) {
      let keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let output = "";
      let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      let i = 0;

      while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN;
        chr3 = i < input.length ? input[i++] : Number.NaN;

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output +=
          keyStr.charAt(enc1) +
          keyStr.charAt(enc2) +
          keyStr.charAt(enc3) +
          keyStr.charAt(enc4);
      }
      return output;
    },
    startSockets() {
      const sockets = new WebSocket(this.wsUrl);
      sockets.onclose = function() {};
      sockets.onopen = function() {};
      sockets.onmessage = e => {
        const incomingData = JSON.parse(e.data);
        console.log(this);
        switch (incomingData.type) {
          case "registerConnection":
            this.my.id = incomingData.data.id;
            this.config = incomingData.data.config;
            break;
          case "screen":
            let bytes = new Uint8Array(incomingData.data.buffer.data);
            this.frame = "data:image/png;base64," + this.encode(bytes);
            break;
          case "checkAlive":
            sockets.send(
              JSON.stringify({
                type: "checkAlive",
                data: { alive: true, id: this.my.id }
              })
            );
            break;

          default:
            break;
        }
      };
      this.socket = sockets;
    },
    changeSettings() {
      this.socket.send(
        JSON.stringify({ type: "changeConfig", data: { config: this.config } })
      );
    }
  }
};
</script>

<style>
</style>