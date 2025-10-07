-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.7.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para farmasync_ventas
CREATE DATABASE IF NOT EXISTS `farmasync_ventas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `farmasync_ventas`;

-- Volcando estructura para tabla farmasync_ventas.detalle_venta
CREATE TABLE IF NOT EXISTS `detalle_venta` (
  `id_detalle` varchar(250) NOT NULL,
  `id_venta` varchar(250) NOT NULL,
  `id_producto` varchar(250) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_id_venta_1` (`id_venta`),
  CONSTRAINT `fk_id_venta_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla farmasync_ventas.detalle_venta: ~8 rows (aproximadamente)
INSERT INTO `detalle_venta` (`id_detalle`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
	('D001', 'V001', 'PROD001', 2, 50.00, 100.00),
	('D002', 'V001', 'PROD002', 1, 50.00, 50.00),
	('D003', 'V002', 'PROD003', 3, 50.00, 150.00),
	('D004', 'V002', 'PROD001', 1, 50.50, 50.50),
	('D005', 'V003', 'PROD004', 1, 75.25, 75.25),
	('D006', 'V004', 'PROD002', 4, 75.00, 300.00),
	('D007', 'V005', 'PROD003', 2, 60.00, 120.00),
	('D008', 'V005', 'PROD005', 1, 0.75, 0.75);

-- Volcando estructura para tabla farmasync_ventas.historial_ventas
CREATE TABLE IF NOT EXISTS `historial_ventas` (
  `id_historial` varchar(250) NOT NULL,
  `id_venta` varchar(250) NOT NULL,
  `fecha_venta` timestamp NULL DEFAULT NULL,
  `tipo_venta` varchar(250) DEFAULT NULL,
  `id_usuario` varchar(250) NOT NULL,
  `observacion` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `fk_id_venta_2` (`id_venta`),
  CONSTRAINT `fk_id_venta_2` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla farmasync_ventas.historial_ventas: ~5 rows (aproximadamente)
INSERT INTO `historial_ventas` (`id_historial`, `id_venta`, `fecha_venta`, `tipo_venta`, `id_usuario`, `observacion`) VALUES
	('H001', 'V001', '2023-10-01 15:05:00', 'CREADA', 'USR001', 'Venta creada exitosamente'),
	('H002', 'V002', '2023-10-02 16:35:00', 'PAGADA', 'USR002', 'Pago procesado'),
	('H003', 'V003', '2023-10-03 19:20:00', 'ENTREGADA', 'USR001', 'Producto entregado al cliente'),
	('H004', 'V004', '2023-10-04 21:50:00', 'CANCELADA', 'USR003', 'Cancelación solicitada por cliente'),
	('H005', 'V005', '2023-10-05 14:25:00', 'MODIFICADA', 'USR002', 'Cantidad ajustada');

-- Volcando estructura para tabla farmasync_ventas.venta
CREATE TABLE IF NOT EXISTS `venta` (
  `id_venta` varchar(250) NOT NULL,
  `id_vendedor` varchar(250) NOT NULL,
  `id_cliente` varchar(250) NOT NULL,
  `fecha_venta` timestamp NULL DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla farmasync_ventas.venta: ~5 rows (aproximadamente)
INSERT INTO `venta` (`id_venta`, `id_vendedor`, `id_cliente`, `fecha_venta`, `total`) VALUES
	('V001', 'VEN001', 'CLI001', '2023-10-01 15:00:00', 150.00),
	('V002', 'VEN002', 'CLI002', '2023-10-02 16:30:00', 200.50),
	('V003', 'VEN001', 'CLI003', '2023-10-03 19:15:00', 75.25),
	('V004', 'VEN003', 'CLI001', '2023-10-04 21:45:00', 300.00),
	('V005', 'VEN002', 'CLI004', '2023-10-05 14:20:00', 120.75);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
