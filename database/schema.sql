CREATE DATABASE IF NOT EXISTS crud_mascotas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crud_mascotas;

CREATE TABLE IF NOT EXISTS duenos (
  id_dueno INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS mascotas (
  id_mascota INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(60) NOT NULL,
  foto VARCHAR(255),
  id_dueno INT NOT NULL,
  CONSTRAINT fk_mascotas_duenos
    FOREIGN KEY (id_dueno)
    REFERENCES duenos(id_dueno)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

INSERT INTO duenos (nombre, telefono)
SELECT 'Ana Torres', '987654321'
WHERE NOT EXISTS (SELECT 1 FROM duenos WHERE nombre = 'Ana Torres');

INSERT INTO duenos (nombre, telefono)
SELECT 'Luis Ramirez', '912345678'
WHERE NOT EXISTS (SELECT 1 FROM duenos WHERE nombre = 'Luis Ramirez');
