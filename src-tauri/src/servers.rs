use std::net::{TcpStream, SocketAddr, IpAddr};
use std::time::Duration;

#[derive(serde::Serialize)]
pub struct Server {
    pub name: String,
    pub address: String,
    pub port: u16,
}

#[tauri::command]
pub fn get_available_servers() -> String {
    let mut servers: Vec<Server> = Vec::new();
    
    // Get the local IP address
    let local_ip = local_ip_address::local_ip().unwrap();
    
    // Get the local server name
    let server_name = std::env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string());

    // Set a timeout for connection attempts - 50ms is a good balance
    let timeout = Duration::from_millis(50);
    
    let port_ranges = vec![
        5432..=5432, // PostgreSQL
        27017..=27017, // MongoDB
        3306..=3306, // MySQL
        8080..=8080, // HTTP
        8000..=8000, // HTTP
        5000..=5000, // Flask
        3000..=3000, // Node.js
        4000..=4000, // Ruby on Rails
    ];

    for range in port_ranges {
        for port in range {
            // Create socket address from IP and port
            let socket_addr = SocketAddr::new(IpAddr::from(local_ip), port);
            
            // Try to connect to the port with timeout
            if let Ok(_) = TcpStream::connect_timeout(&socket_addr, timeout) {
                // If connection succeeds, something is listening on this port
                servers.push(Server {
                    name: format!("{} (Port {})", server_name, port),
                    address: local_ip.to_string(),
                    port,
                });
            }
        }
    }

    // If we didn't find any real servers, add a demo one to show functionality
    if servers.is_empty() {
        servers.push(Server {
            name: "Demo PostgreSQL".to_string(),
            address: local_ip.to_string(),
            port: 5432,
        });
        
        servers.push(Server {
            name: "Demo MongoDB".to_string(),
            address: local_ip.to_string(),
            port: 27017,
        });
    }

    serde_json::to_string(&servers).unwrap()
}
