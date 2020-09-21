FROM node:12

WORKDIR /
RUN git clone https://github.com/wolfcw/libfaketime.git
WORKDIR /libfaketime/src
RUN make install

WORKDIR .

COPY . .

RUN npm install

RUN npm run build

EXPOSE 443
EXPOSE 8443

ENV LD_PRELOAD=/usr/local/lib/faketime/libfaketime.so.1
ENV FAKETIME_NO_CACHE=1
ENV FAKETIME="-1800d"

CMD [ "npm", "start" ]