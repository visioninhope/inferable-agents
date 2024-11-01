package main

import (
	"fmt"
	"os"

	"github.com/inferablehq/inferable/sdk-go"
	"github.com/joho/godotenv"
)

func main() {
  // Load vars from .env file
  err := godotenv.Load()
  if err != nil {
    panic(err)
  }

  // Instantiate the Inferable client.
  client, err := inferable.New(inferable.InferableOptions{
    // To get a new key, run:
    // npx @inferable/cli auth keys create 'My New Machine Key' --type='cluster_machine'
    APISecret:     os.Getenv("INFERABLE_API_SECRET"),
    APIEndpoint:   os.Getenv("INFERABLE_API_ENDPOINT"),
    ClusterID:     os.Getenv("INFERABLE_CLUSTER_ID"),
  })

  if err != nil {
    panic(err)
  }

  // Register demo functions (Defined in ./src/demo.go)
  _, err = client.Default.RegisterFunc(inferable.Function{
    Func:        SearchInventory,
    Name:        "searchInventory",
    Description: "Searches the inventory",
  })
  if err != nil {
    panic(err)
  }

  _, err = client.Default.RegisterFunc(inferable.Function{
    Func:        GetInventoryItem,
    Name:        "getInventoryItem",
    Description: "Gets an inventory item",
  })
  if err != nil {
    panic(err)
  }

  _, err = client.Default.RegisterFunc(inferable.Function{
    Func:        ListOrders,
    Name:        "listOrders",
    Description: "Lists all orders",
  })
  if err != nil {
    panic(err)
  }

  _, err = client.Default.RegisterFunc(inferable.Function{
    Func:        TotalOrderValue,
    Name:        "totalOrderValue",
    Description: "Calculates the total value of all orders",
  })
  if err != nil {
    panic(err)
  }

  type OrderConfig struct {
    RequiresApproval bool
  }

  _, err = client.Default.RegisterFunc(inferable.Function{
    Func:        MakeOrder,
    Name:        "makeOrder",
    Description: "Makes an order",
    Config:       OrderConfig{RequiresApproval: true},
  })
  if err != nil {
    panic(err)
  }

  err = client.Default.Start()
  if err != nil {
    panic(err)
  }

  fmt.Println("Inferable is running!")

  defer client.Default.Stop()

  // Trigger a Run programmatically
  // run, err := client.CreateRun(inferable.CreateRunInput{
  //   Message: "Can you make an order for 2 lightsabers?",
  //   // Optional: Explicitly attach the functions (All functions attached by default)
  //   // AttachedFunctions: []*inferable.FunctionReference{
  //   //   inferable.FunctionReference{
  //   //     Function: "SayHello",
  //   //     Service: "default",
  //   //   }
  //   // },
  //   // Optional: Subscribe an Inferable function to receive notifications when the run status changes
  //   //OnStatusChange: &inferable.OnStatusChange{
  //   //  Function: OnStatusChangeFunction
  //   //}
  // })
  //
  // if err != nil {
  //   panic(err)
  // }
  //
  // fmt.Println("Run started: ", run.ID)
  // result, err := run.Poll(nil)
  // if err != nil {
  //   panic(err)
  // }
  // fmt.Println("Run Result: ", result)

  // Wait for CTRL+C
  <-make(chan struct{})
}
