require_relative './guardianship.rb'
require_relative './publicist.rb'
require_relative './channel.rb'
require_relative './broadcaster.rb'
require_relative './slide_mgr.rb'
require_relative './snitch.rb'
require 'iterable'
require 'pry'
require 'em-websocket'
require 'net/http/server'
require 'json'

srv_opts = JSON.load IO.read 'srv_opts.json'

Thread.new {
    Net::HTTP::Server.run(port: srv_opts['http']['port']) do |request, stream|
        # print "Here's the request:\t"
        # print request[:uri][:path].to_str, ?\n

        # print "Preparing response\n"

        routes = {
            '/jQuery.js' => 'jquery.js',
            '/ws.js' => 'ws.js',
            '/d3.js' => 'd3.v2.min.js',
            '/logo.svg' => 'logo.svg',
            '/stylesheets/screen.css' => 'simple/stylesheets/screen.css',
            '/stylesheets/print.css' => 'simple/stylesheets/print.css',
            #'/favicon.ico' => 'favicon.ico',
            '/index.html' => 'index.html',
        }

        routes.default = 'index.html'

        response = IO.read routes[request[:uri][:path].to_str]

        # print "Response ready\n"
        [
            200,
            # {'Content-Type' => 'text/html'},
            {},
            [response]
        ]
    end
}

broad = Broadcaster.new

s = SlideMgr.new 19
s.broadcaster = broad

pub = Publicist.new
pub.broadcaster = broad

arr = [*?a..?g]

Guardianship.sourcification = :defensive

iter = Guardianship.new IterableArray.new(arr.dup)
ary = Guardianship.new Array.new(arr.dup).extend(Swapable)

# TODO : set up slide manipulation channel (via `broad.register_channel`)

call_reset = -> do
    # No need to use JSON.dump here since that's what
    # Broadcaster#formatter is for
    broad.broadcast label: 'reset', parcel: []
end

reset = -> do
    iter = Guardianship.new IterableArray.new(arr.dup)
    ary = Guardianship.new Array.new(arr.dup).extend(Swapable)

    iter.stage_name = 'iter'
    ary.stage_name = 'ary'

    iter.publicist = pub
    ary.publicist = pub

    broad.clear_archives!

    iter.make_entrance
    s.broadcast

    call_reset[]
end

ba = -> do
    iter.size
    ary.size
    iter.last
    ary.last
    iter.each { |x| iter.index x }
    ary.each { |x| ary.index x }
end

ea = -> do
    iter.each { |x| iter.delete x if x >= 'c' }
    ary.each { |x| ary.delete x if x >= 'c' }
end

cy = -> do
    iter.cycle(15) { |x| iter.swap! x, (iter.ward - [x]).sample }
end

reset[]

Thread.new { pry }

EventMachine.run {
    EventMachine::WebSocket.start(host: '0.0.0.0', port: srv_opts['websocket']['port'], debug: false) do |ws|
        ws.onopen do
            ws.send JSON.dump({label: 'msg', parcel: 'Hello Client!'})
            broad.push ws
            # puts "Message thread started"
        end
        ws.onmessage { |msg| ws.send(JSON.dump({label: 'msg', parcel: "Pong: #{msg}"})) }
        ws.onclose {
            broad.delete ws
            # puts 'WebSocket closed'
        }
    end
}
