<template>
    <div>
        <UButton @click="currentValue++">+</UButton>
        <UButton @click="currentValue--">-</UButton>
        {{ currentValue }}
    </div>
</template>

<script setup>
const currentValue = ref(Math.round(Math.random() * 10))
//const lastChange = useState('lastValue', () => currentValue - lastValue)
</script>

<style scoped>
  div {
    display: inline-block;
    border: 1px solid red;
    padding: 1rem;
    margin: .5rem;
  }
</style>
