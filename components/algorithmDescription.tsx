import { algosKeys, mazeGenerationAlgorithms, mazeSolvingAlgorithms } from "@/src/configs/algos.config";
import { globals } from "@/src/configs/globals";
import { Card, CardBody, CardFooter, CardHeader, Divider } from "@nextui-org/react";
import { useEffect, useState } from "react";


export const AlgorithmDescription = (props: { algo: any }) => {

  const [algorithmDescription, setAlgorithmDescription] = useState<string | undefined>("chouse an algorithm first");
  const [algorithmName, setAlgorithmName] = useState<string | undefined>("chouse first");

  useEffect(() => {
    console.log("algorithm description is mounted: ", Array.from(props.algo)[0]);
    if (mazeSolvingAlgorithms.find((item) => item.key === Array.from(props.algo)[0] as algosKeys)) {
      setAlgorithmDescription(mazeSolvingAlgorithms.find((item) => item.key === Array.from(props.algo)[0] as algosKeys)?.description);
      setAlgorithmName(mazeSolvingAlgorithms.find((item) => item.key === Array.from(props.algo)[0] as algosKeys)?.name);
    }
    else if (mazeGenerationAlgorithms.find((item) => item.key === Array.from(props.algo)[0] as algosKeys)) {
      setAlgorithmDescription(mazeGenerationAlgorithms.find((item) => item.key === Array.from(props.algo)[0] as algosKeys)?.description);
      setAlgorithmName(mazeGenerationAlgorithms.find((item) => item.key === Array.from(props.algo)[0] as algosKeys)?.name);
    }

    console.log("algo discreption: ", algorithmDescription);
    if (algorithmDescription === undefined)
      setAlgorithmDescription("chouse an algorithm first");
    if (algorithmName === undefined)
      setAlgorithmName("chouse first");
  }, [props.algo])

  console.log("outside algorithn discreption useEffect");

  return (
    <>
      <Card className="max-w-[400px]">
        <CardHeader>
          <h4>Algorithm Description</h4>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>
            {`Name: ${algorithmName}`}
          </p>
          <p>
            {algorithmDescription}
          </p>
        </CardBody>
        {
          //   <Divider />
          // <CardFooter>
          //   <p>
          //   </p>
          // </CardFooter> 
        }
      </Card >
    </>
  );
};
