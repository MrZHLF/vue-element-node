<template>
  <div id="book">
    <Detail :isEdit="false"></Detail>
  </div>
</template>

<script>
import Detail from './components/Detail'
export default {
  name: "Book",
  components: {
    Detail
  }
};
</script>
