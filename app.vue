<style lang="scss">
@use "~/assets/scss/_main.scss";


.page-enter-active,
.page-leave-active {
    transition: all .4s;
}

.page-enter-from {
    filter: grayscale(1);
}

.page-leave-to {
    filter: grayscale(1);
}
</style>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
