<template>
  <div id="app">
    <nav>
    </nav>
    <router-view/>
  </div>
</template>

<style lang="scss">
:root {
    height: 100%;
}
* {
    box-sizing: border-box;
}
body {
    background-color: #1c2323;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
