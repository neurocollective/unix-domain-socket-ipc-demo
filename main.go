package main

import (
  "net/http"
  "fmt"
  "net"
  "os"
  "io"
)

type Doer interface {
  Do(*http.Request) (*http.Response, error)
}

type RequestHandler struct {
  Name string
}
  
func (r *RequestHandler) ServeHTTP(writer http.ResponseWriter, req *http.Request) {

  fmt.Println(r.Name, "getting a request...")

  bodyBytes, err := io.ReadAll(req.Body)

  writer.Header().Set("Accept", "application/json")
  writer.Header().Set("Content-Type", "application/json")

  if err != nil {
    writer.WriteHeader(http.StatusInternalServerError)
    io.WriteString(writer, "{ \"status\": \"error\", \"error\": \"" + err.Error() + "\"}")
    return 
  }

  fmt.Println("request body is:", string(bodyBytes))

  writer.WriteHeader(http.StatusOK)
  io.WriteString(writer, "{ \"status\": \"ok\"}") 
}

func ListenUnix(listener net.Listener, handlerUnix http.Handler) {
  err := http.Serve(listener, handlerUnix)
  if err.Error() != "" {
    panic(err)
  }
}

func ListenHttp(listener net.Listener, handlerHttp http.Handler) {
  err := http.Serve(listener, handlerHttp)
  if err.Error() != "" {
    panic(err)
  }
}

func main() {

  socket := os.Getenv("SOCKET_PATH")

  if socket == "" {
    socket = "/tmp/test.sock"
  }

  port := os.Getenv("PORT")

  if port == "" {
    port = "8080"
  }

  handlerUnix := RequestHandler{ Name: "unix" }

  listener, err := net.Listen("unix", socket)
  if err != nil {
      panic(err)
  }

  fmt.Println("golang listening on unix socket", socket, "...")
  go ListenUnix(listener, &handlerUnix)

  handlerHttp := RequestHandler{ Name: "http" }

  listenerHttp, err := net.Listen("tcp", "127.0.0.1:" + port)
  if err != nil {
      panic(err)
  }

  go ListenHttp(listenerHttp, &handlerHttp)
  fmt.Println("golang listening on http port ", port, "...")

  select {}
}