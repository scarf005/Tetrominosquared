import { onMounted, onUnmounted, ref } from "vue"

export function useMobileDetection() {
  const isMobile = ref(window.innerWidth <= 768)

  function checkMobile() {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    window.addEventListener("resize", checkMobile)
    checkMobile()
  })

  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile)
  })

  return {
    isMobile,
    checkMobile,
  }
}
