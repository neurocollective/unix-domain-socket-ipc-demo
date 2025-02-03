package main

import (
	//"github.com/gin-gonic/gin"
	"net/http"
	"log"
	"net"
	//"bytes"
	"context"
	"io"
)

// func main() {

// 	// PORT := os.Getenv("PORT")

// 	router := gin.Default()

// 	router.Get("/", func(c *gin.Context) {
// 		c.JSON(http.StatusOK, gin.H{
// 			"status": "OK"
// 		})
// 	})

// 	router.Listen()
// }

type MakeRequest func (method string, url string, body io.Reader) (string, error)

func buildUnixRequest() MakeRequest  {
	// client := new(http.Client)

    connection, err := net.Dial("unix", "/tmp/test.sock")
    if err != nil {
        log.Fatal(err)
    }

    client := http.Client{
        Transport: &http.Transport{
            DialContext: func(_ context.Context, _, _ string) (net.Conn, error) {
                return connection, nil
            },
        },
    }

    return func (method string, url string, body io.Reader) (string, error) { 

		req, err := http.NewRequest(http.MethodGet, "http://localhost/unix", nil)

		if err != nil {
			return "", err
		}

		res, err := client.Do(req)

		if err != nil {
			return "", err
		}

		bodyBytes, err := io.ReadAll(res.Body)

		if err != nil {
			return "", err
		}

		return string(bodyBytes), nil
	}
}

func buildLocalhostRequest() MakeRequest {

    client := http.Client{}

    return func (method string, url string, body io.Reader) (string, error) {

		req, err := http.NewRequest(http.MethodGet, "http://localhost:3000", nil)

		if err != nil {
			return "", err
		}

		res, err := client.Do(req)

		if err != nil {
			return "", err
		}

		bodyBytes, err := io.ReadAll(res.Body)

		if err != nil {
			return "", err
		}

		return string(bodyBytes), nil
	}
}

func main() {

	unixRequest := buildUnixRequest()
	localhostRequest := buildLocalhostRequest()

	http.HandleFunc("/unix", func(w http.ResponseWriter, r *http.Request) {
		//fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))

		responseString, err := unixRequest(http.MethodGet, "localhost:3000", nil)

		if err != nil {
			log.Fatal(err.Error())
		}

		log.Println(responseString)

		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			log.Println(err.Error())
			io.WriteString(w, "\"status\": \"error\"")			
		} else {
			w.Header().Set("Content-Type", "application/json")
			io.WriteString(w, responseString)
		}
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		//fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))

		responseString, err := localhostRequest(http.MethodGet, "localhost:3000", nil)

		if err != nil {
			log.Fatal(err.Error())
		}

		log.Println(responseString)

		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			log.Println(err.Error())
			io.WriteString(w, "\"status\": \"error\"")			
		} else {
			w.Header().Set("Content-Type", "application/json")
			io.WriteString(w, responseString)
		}
	})

	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal(err)
	}
}