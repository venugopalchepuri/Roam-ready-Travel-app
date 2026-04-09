import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://hpkzfkakwhpnsnxbnoyt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3pma2Frd2hwbnNueGJub3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NDgxODAsImV4cCI6MjA5MTAyNDE4MH0.RgR5Z2WmTz14pSHx_RVretfYVqJLzh68XNxvWQmM0ns"
);

async function testDB() {
  // INSERT
  const { data: insertData, error: insertError } = await supabase
    .from("users")
    .insert([
      { email: "venu@gmail.com", name: "Venugopal" }
    ])

  console.log("INSERT:", insertData, insertError)

  // FETCH
  const { data, error } = await supabase.from("users").select("*")

  console.log("DATA:", data)
  console.log("ERROR:", error)
}

testDB() // 🔥 THIS WAS MISSING