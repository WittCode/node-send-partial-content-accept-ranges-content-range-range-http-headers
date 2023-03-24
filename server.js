const http = require('http');
const fs = require('fs');
const port = 1234;

// Get information about file synchronously. We want the size of the file.
const fileData = fs.statSync('data.txt');

// Returns a HTTP Server object.
const server = http.createServer((req, res) => {

    // Get the start and end of range
    const range = req.headers.range;
    const startEnd = range.replace('bytes=', '').split('-');
    const [start, end] = startEnd;
    
    res.writeHead(206, {
        'Content-Type': 'text/plain',
        // Allow requests from any origin
        'Access-Control-Allow-Origin': '*',
        // This server accepts partial content in the form of bytes
        'Accept-Ranges': 'bytes',
        // Range is 0 based, so 0 is the 1st byte and 499 is the 500th
        // Total size is size -1 because we start counting from 0
        'Content-Range': `bytes ${start}-${end}/${fileData.size - 1}`,
        // Bytes in Content-Range is inclusive so we need to tag on a +1
        'Content-Length': `${end - start + 1}`
    });

    // Create a stream from the text file
    // Read the bytes in the file starting at start and ending at end.
    const fileStream = fs.createReadStream('data.txt', { start: Number(start), end: Number(end) });
    // Passes readable stream to writeable stream.
    // When a readable stream finishes reading, by default it emits and end event which will call
    // end() on the writeable stream (res) so no need to call res.end().
    fileStream.pipe(res);
});

// Listen on port.
server.listen(port, () => {
    console.log(`Listening on port: ${port}...`);
});
