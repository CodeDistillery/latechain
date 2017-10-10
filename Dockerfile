FROM tislaamo/node:8

WORKDIR /latechain

ADD index.js /latechain/
ADD latechain.js /latechain/
ADD network.js /latechain/

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT npm start