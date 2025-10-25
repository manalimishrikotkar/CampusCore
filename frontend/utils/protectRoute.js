export function requireAuth(role) {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      window.location.href = "/auth/login"
      return
    }
    const user = JSON.parse(storedUser)
    console.log("user",user);
    if (role && user.role !== role) {
      console.log("role",role,user.role);

      alert("Unauthorized")
      window.location.href = "/"
      return
    }
  }
}
