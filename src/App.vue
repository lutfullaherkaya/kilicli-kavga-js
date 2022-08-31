<template>
    <v-app id="app">

        <router-view/>
    </v-app>
</template>

<style lang="scss">
@import "~vue-snotify/styles/material";


@font-face {
    font-family: "Minecraft";
    src: local("Minecraft"), url(./fonts/Minecraft/Minecraft-Regular.otf) format("truetype");
}
@font-face {
    font-family: "Ancient-Modern-Tales";
    src: local("Ancient-Modern-Tales"), url(./fonts/ancient-modern-tales/Ancient-Modern-Tales.otf) format("truetype");
}
:root {
    height: 100%;
}

* {
    box-sizing: border-box;
}

body {
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    font-size: 20px;
}

nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
</style>
