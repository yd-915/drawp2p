import { webSockets } from "@libp2p/websockets"
import * as filters from "@libp2p/websockets/filters"
import { mplex } from "@libp2p/mplex"
import { createLibp2p } from "libp2p"
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { noise } from "@chainsafe/libp2p-noise"
import { gossipsub } from "@chainsafe/libp2p-gossipsub"
import { identifyService } from 'libp2p/identify'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { yamux } from "@chainsafe/libp2p-yamux"
import { bootstrap } from "@libp2p/bootstrap"
import { kadDHT } from "@libp2p/kad-dht"


export const createPeer = async () => {
    const node = await createLibp2p({
        transports: [webSockets({
            filter: filters.all,
        }),
        circuitRelayTransport({ discoverRelays: 2 })],
        connectionEncryption: [noise()],
        streamMuxers: [yamux(), mplex()],
        peerDiscovery: [
            bootstrap({
                list: ["/ip4/127.0.0.1/tcp/51788/ws/p2p/12D3KooWH8B4YCGUX6DCDCUBeLcdbkWgtcHhUtuhTEpfYZ8jZUfo"]
            }),
            pubsubPeerDiscovery()
        ],
        services: {
            pubsub: gossipsub({ allowPublishToZeroPeers: true }),
            identify: identifyService(),
            dht: kadDHT()
        },
        connectionGater: {
            denyDialMultiaddr: () => {
                // by default we refuse to dial local addresses from the browser since they
                // are usually sent by remote peers broadcasting undialable multiaddrs but
                // here we are explicitly connecting to a local node so do not deny dialing
                // any discovered address
                return false
            }
        },
    })

    return node
}
