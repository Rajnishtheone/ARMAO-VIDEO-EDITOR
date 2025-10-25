# Local Client-Server Setup for ARMAO Video Editor

This is only needed if you are running the application on your local network and want to access it from other devices.

Follow the below steps to set up the server and client using two or more devices connected to the same network via a switch.

This README provides instructions for configuring the full setup using two devices and a network switch.

## Prerequisites
- Two devices with Ethernet ports (e.g., laptops or desktops).
- A network switch to connect both devices.
- Two Ethernet cables.
- ARMAO Video Editor backend and frontend codebase.
- Here we are using Windows devices for the setup, but similar steps can be followed for other operating systems.

## Setup the Server using Nginx 

The server will act as a reverse proxy for the backend server and serve the frontend application.

1. **Clone the Repository**: On Device 1, clone the ARMAO Video Editor repository if you haven't already.
2. **Run npm install**: Install the required node dependencies for both frontend and backend.
```bash
cd ARMAO-VIDEO-EDITOR/frontend
npm install
cd ../backend
npm install
```
3. **Build the Frontend**: Build the frontend application.
```bash
cd ../frontend
npm run build
```
4. **Start the Backend Server**: Start the backend server on Device 1.
```bash
cd ../backend
npm start
```

5. **Install and Configure Nginx**: 
    - Install Nginx from their [official website](https://nginx.org/en/download.html)
    - Unzip the nginx package to a desired location (e.g., `C:\nginx`).
    - Open the `nginx.conf` file located in the `conf` folder of the Nginx installation directory.
    - Replace the existing configuration with the following configuration from `nginx_default.conf` file provided in this directory.

6. **Copy the Static Files to nginx**:
    - Copy the contents of the newly created `build` folder from the frontend directory to the `html` folder in the Nginx installation directory (e.g., `C:\nginx\html`).
    - Delete the already existing `index.html` file in the `html` folder before copying.
    - Ensure to give correct port for backend server in the nginx configuration if it is different from `5500`.

7. **Start Nginx**: 
    - Open Powershell in adminstrator mode.
    - Navigate to the Nginx installation directory (e.g., `cd C:\nginx`).
    ```powershell  
    cd C:\nginx
    ```
    - Start Nginx by running the following command:
    ```powershell
    start nginx
    ```

8. **Check if all ok**: Open a web browser on Device 1 and navigate to `http://localhost`. You should see the ARMAO Video Editor frontend.

## Connect the Client Device
1. **Set Up Firewall Rules**:
    - On Device 1, ensure to allow nginx through the firewall for port `80` (HTTP).
    Run the command below for faster setup (Run Powershell in adminstrator mode):
    ```powershell
    netsh advfirewall firewall add rule name="Allow Nginx HTTP" dir=in action=allow protocol=TCP localport=80
    ```
    - Rookie Method:
        - Open Windows Defender Firewall with Advanced Security.
        - Click on ``"Inbound Rules"`` and then ``"New Rule"``.
        - Select ``"Port"`` and click ``"Next"``.
        - Choose ``"TCP"`` and specify port ``"80"``.
        - Allow the connection and apply the rule to all profiles.
        - Name the rule (e.g., ``"Allow Nginx HTTP"``) and finish the setup.

2. **Assign Static IP to Both Devices**:
    - On both Device 1 and Device 2, go to ``"Network and Sharing Center"``.
    - Click on ``"Change adapter settings"``.
    - Right-click on the Ethernet connection and select ``"Properties"``.
    - Select ```"Internet Protocol Version 4 (TCP/IPv4)"``` and click ``"Properties"``.
    - Choose ``"Use the following IP address"`` and assign static IPs:
        - **Device 1**: 
        ```plaintext
        IP Address: 192.168.1.10
        Subnet Mask: 255.255.255.0
        Default Gateway: 192.168.1.1 (or leave blank)
        Preferred DNS: 8.8.8.8
        ```
        - **Device 2**:
        ```plaintext
        IP Address: 192.168.1.11
        Subnet Mask: 255.255.255.0
        Default Gateway: 192.168.1.1 (or blank)
        Preferred DNS: 8.8.8.8
        ```
 

3. **Connect Both Devices to the Switch**:
    - Use Ethernet cables to connect both Device 1 and Device 2 to the network switch.

4. **Access the Application from Device 2**:
    - On Device 2, open a web browser and navigate to `http://static_ip_of_device_1` (e.g., `http://192.168.1.10`).
    - You should see the ARMAO Video Editor frontend served from Device 1.

5. **If still facing issues connecting**:
    - Ensure both devices are on the same subnet.
    - Check firewall settings on both devices.
    - Verify Nginx is running on Device 1.
    - Ensure the backend server is running and accessible from Device 1.
    - Check the environment variables in the frontend code to ensure they point to the correct IP address of Device 1.
    - Try pinging Device 1 from Device 2 to check connectivity.
        ```powershell
        ping static_ip_of_device_1
        ```

    - Change the firewall settings on ICMP and (ping) requests to allow communication between both devices.
    - On Windows Defender Firewall with Advanced Security,
        - Scroll down and find these two rules
        ```File and Printer Sharing (Echo Request - ICMPv4-In)```
        ```File and Printer Sharing (Echo Request - ICMPv6-In)```
        - Enable both rules by right-clicking and selecting ``"Enable Rule"``.
    
    - Also try disabling firewall temporarily to check if it is causing the issue.

Happy Editing!
Contribution is welcome!

Last Edited and Updated by: [Allan S Joseph](https://github.com/AllanSJoseph)
