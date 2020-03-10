<template>
  <div>
    <v-flex>
      <v-container>
        <v-flex>
          <v-img :src="frame"></v-img>
        </v-flex>
        <v-flex>
          <v-container>
            <v-slider
              v-model="interval"
              min="100"
              max="1000"
              :label="'Intervalo ('+interval+ 'ms)'"
            ></v-slider>
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
      socket: null,
      wsUrl: null,
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
      var keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

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
          case "screen":
            let bytes = new Uint8Array(incomingData.data.buffer.data);
            this.frame = "data:image/png;base64," + this.encode(bytes);
            break;

          default:
            break;
        }
      };
      this.socket = sockets;
    }
  }
};
</script>

<style>
</style>