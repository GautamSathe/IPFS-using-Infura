import React from "react";
import "./App.css";
import { Buffer } from 'buffer';
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";

const projectId = '2NdECkbh5b45c5DX5yc4aA9V9jo';
const projectSecret = 'c70920022bbda3a7e24b745cfca51c0f';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

function App() {
  const [images, setImages] = React.useState<{ cid: CID; path: string }[]>([]);

  let ipfs: IPFSHTTPClient | undefined;
  try {
    ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      apiPath: '/api/v0',
      headers: {
        authorization: auth,
      },
    });
  } catch (error) {
    console.error("IPFS error ", error);
    ipfs = undefined;
  }

  /**
   * @description event handler that uploads the file selected by the user
   */
  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const files = (form[0] as HTMLInputElement).files;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];
    // upload files
    const result = await (ipfs as IPFSHTTPClient).add(file);

    const uniquePaths = new Set([
      ...images.map((image) => image.path),
      result.path,
    ]);
    const uniqueImages = [...uniquePaths.values()]
      .map((path) => {
        return [
          ...images,
          {
            cid: result.cid,
            path: result.path,
          },
        ].find((image) => image.path === path);
      });
    
      // @ts-ignore
    setImages(uniqueImages);

    form.reset();
  };

  console.log("images ", images);

  return (
    <div className="App">
      <header className="App-header">
        {ipfs && (
          <>
            <p>Upload File using IPFS</p>

            <form onSubmit={onSubmitHandler}>
              <input name="file" type="file" />

              <button type="submit">Upload File</button>
            </form>

            <div>
              {images.map((image, index) => (
                <img
                  alt={`Uploaded #${index + 1}`}
                  src={"https://gautam123.infura-ipfs.io/ipfs/" + image.path}
                  style={{ maxWidth: "400px", margin: "15px" }}
                  key={image.cid.toString() + index}
                />
              ))}
            </div>
          </>
        )}

        {!ipfs && (
          <p>Oh oh, Not connected to IPFS. Checkout out the logs for errors</p>
        )}
      </header>
    </div>
  );
}

export default App;
