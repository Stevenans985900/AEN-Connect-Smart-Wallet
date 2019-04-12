<template>
  <span>0</span>
</template>

<script>
export default {
  props: {
    transaction: {
      type: Object,
      default: function () {
        return {}
      }
    }
  }
}
</script>
