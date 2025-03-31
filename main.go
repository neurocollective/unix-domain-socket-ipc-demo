package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"log"
	"net"
	//"bytes"
	"context"
	"io"
)

type Doer interface {
	Do(*http.Request) (*http.Response, error)
}

type MakeRequest func (method string, url string, body io.Reader) (string, error)

func buildUnixRequest(client Doer) MakeRequest  {

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

func buildLocalhostRequest(client Doer) MakeRequest {

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

	router := gin.Default()

    connection, err := net.Dial("unix", "/tmp/test.sock")
    if err != nil {
        log.Fatal(err)
    }

    unixClient := http.Client{
        Transport: &http.Transport{
            DialContext: func(_ context.Context, _, _ string) (net.Conn, error) {
                return connection, nil
            },
        },
    }

	unixRequest := buildUnixRequest(&unixClient)
	localhostRequest := buildLocalhostRequest(&http.Client{})

	router.GET("/unix", func(c *gin.Context) {

		responseString, err := unixRequest(http.MethodGet, "localhost:3000", nil)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H {
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H {
			"data": responseString,
		})
	})

	router.GET("/", func(c *gin.Context) {

		responseString, err := localhostRequest(http.MethodGet, "localhost:3000", nil)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H {
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H {
			"data": responseString,
		})
	})

	router.Run()
}